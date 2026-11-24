import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const requireWeb = createRequire(resolve("apps/web/package.json"));
const { chromium, expect } = requireWeb("@playwright/test");
const { VITE_WEB_URL, VITE_SERVER_URL } = process.env;
assert(VITE_WEB_URL && VITE_SERVER_URL, "Set the web and server URLs for the production smoke fixture.");

const webUrl = new URL(VITE_WEB_URL.replace(/\/+$/, "") + "/");
const serverUrl = new URL(VITE_SERVER_URL.replace(/\/+$/, "") + "/");
const fixtureOrigins = new Set([webUrl.origin, serverUrl.origin]);
const dashboardUrl = new URL("dashboard", webUrl);
const privateUrl = new URL("private/data", serverUrl);

for (const origin of fixtureOrigins) {
  assert.equal(new URL(origin).hostname, "127.0.0.1", "Use a local disposable production fixture.");
}

const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "en-US" });
  await context.route(/^https?:\/\//, (route) =>
    fixtureOrigins.has(new URL(route.request().url()).origin) ? route.continue() : route.abort()
  );
  const page = await context.newPage();

  const health = await context.request.get(new URL("health/live", serverUrl).href);
  await expect(health).toBeOK();
  const anonymous = await context.request.get(privateUrl.href);
  assert.equal(anonymous.status(), 401);
  assert.equal(anonymous.headers()["cache-control"], "private, no-store");

  const home = await page.goto(webUrl.href);
  assert(home?.ok(), "The production home page did not load.");
  const assets = await page
    .locator('link[rel="stylesheet"], script[type="module"][src]')
    .evaluateAll((elements) =>
      elements.map((element) => (element instanceof HTMLLinkElement ? element.href : element.src))
    );
  assert(
    assets.some((url) => new URL(url).pathname.endsWith(".css")),
    "The document did not reference CSS."
  );
  assert(
    assets.some((url) => new URL(url).pathname.endsWith(".js")),
    "The document did not reference JavaScript."
  );
  for (const url of assets) {
    assert.equal(new URL(url).origin, webUrl.origin);
    const asset = await context.request.get(url);
    assert(asset.ok(), "Could not serve " + new URL(url).pathname + " (" + asset.status() + ").");
    const type = new URL(url).pathname.endsWith(".css") ? /text\/css/ : /javascript/;
    assert.match(asset.headers()["content-type"] ?? "", type);
  }
  const menu = page.getByRole("button", { name: "Toggle menu" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");

  const germanHome = await page.goto(new URL("de/", webUrl).href);
  assert(germanHome?.ok(), "The German home page did not load.");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  const fonts = await page
    .locator('link[rel="preload"][as="font"]')
    .evaluateAll((elements) => elements.map((element) => element.href));
  assert(fonts.length > 0, "The German home page did not reference a font preload.");
  for (const url of fonts) {
    assert.equal(new URL(url).origin, webUrl.origin);
    const font = await context.request.get(url);
    await expect(font).toBeOK();
    assert.match(font.headers()["content-type"] ?? "", /font\/woff2/);
  }

  await page.goto(dashboardUrl.href);
  await expect(page).toHaveURL((url) => url.pathname.endsWith("/sign-in"));
  const createAccountUrl = new URL("create-an-account", webUrl);
  createAccountUrl.searchParams.set("redirect", "/dashboard");
  await page.goto(createAccountUrl.href);
  const name = "Production Smoke Fixture";
  const email = "smoke-" + randomUUID() + "@example.com";
  const password = randomUUID() + "-fixture";
  const form = page.locator("form");
  await form.locator('[name="name"]').fill(name);
  await form.locator('[name="email"]').fill(email);
  await form.locator('[name="password"]').fill(password);
  await form.locator('[name="confirmPassword"]').fill(password);
  await form.locator('[type="submit"]').click();
  await expect(page).toHaveURL((url) => url.pathname === dashboardUrl.pathname);
  await expect(page.getByRole("heading", { name: new RegExp(name) })).toBeVisible();
  await expect(page.getByText("This is private", { exact: false }).first()).toBeVisible();

  const privateResponse = await context.request.get(privateUrl.href);
  await expect(privateResponse).toBeOK();
  assert.equal(privateResponse.headers()["cache-control"], "private, no-store");
  assert.equal((await privateResponse.json()).user.email, email);
  await menu.click();
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(page).toHaveURL((url) => url.pathname.endsWith("/sign-in"));
  assert.equal((await context.request.get(privateUrl.href)).status(), 401);
} finally {
  await browser.close();
}
