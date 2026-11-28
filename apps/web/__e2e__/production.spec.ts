import { randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";

import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context, baseURL }) => {
  const origins = new Set([new URL(baseURL!).origin, new URL(process.env.VITE_SERVER_URL!).origin]);
  await context.route(/^https?:\/\//, (route) =>
    origins.has(new URL(route.request().url()).origin) ? route.continue() : route.abort()
  );
});

test("serves production assets under the web base path", async ({ page, baseURL }) => {
  const home = await page.goto("./");
  expect(home?.ok()).toBe(true);
  const web = new URL(baseURL!);
  const assets = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll<HTMLLinkElement | HTMLScriptElement>(
        'link[rel="stylesheet"], script[type="module"][src]'
      ),
      (element) => (element instanceof HTMLLinkElement ? element.href : element.src)
    )
  );
  expect(assets.some((url) => new URL(url).pathname.endsWith(".css"))).toBe(true);
  expect(assets.some((url) => new URL(url).pathname.endsWith(".js"))).toBe(true);

  const germanHome = await page.goto("de/");
  expect(germanHome?.ok()).toBe(true);
  const fonts = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="font"]'), (element) => element.href)
  );
  expect(fonts.length).toBeGreaterThan(0);

  for (const asset of [...assets, ...fonts]) {
    expect(asset.startsWith(web.href)).toBe(true);
    const response = await page.request.get(asset);
    await expect(response).toBeOK();
    const extension = new URL(asset).pathname.split(".").at(-1);
    const contentType = extension === "css" ? /text\/css/ : extension === "js" ? /javascript/ : /font\/woff2/;
    expect(response.headers()["content-type"]).toMatch(contentType);
  }
});

test("authorizes the private API only while signed in", async ({ context, page, baseURL }) => {
  const web = new URL(baseURL!);
  const server = new URL(process.env.VITE_SERVER_URL!.replace(/\/$/, "") + "/");
  const health = await context.request.get(new URL("health/live", server).href);
  await expect(health).toBeOK();
  const privateUrl = new URL("private/data", server).href;
  const anonymous = await context.request.get(privateUrl);
  expect(anonymous.status()).toBe(401);
  expect(anonymous.headers()["cache-control"]).toBe("private, no-store");

  await page.goto("create-an-account?redirect=%2Fdashboard");
  const name = "Production Smoke Fixture";
  const email = `smoke-${randomUUID()}@example.com`;
  const form = page.locator("form");
  const password = `${randomUUID()}-fixture`;
  await form.locator('[name="name"]').fill(name);
  await form.locator('[name="email"]').fill(email);
  await form.locator('[name="password"]').fill(password);
  await form.locator('[name="confirmPassword"]').fill(password);
  await form.locator('[type="submit"]').click();
  await expect(page).toHaveURL(new URL("dashboard", web).href);

  await page.getByRole("button", { name: "Open account menu", exact: true }).click();
  const account = page.getByRole("menu");
  await expect(account.getByText(name, { exact: true })).toBeVisible();
  await expect(account.getByText(email, { exact: true })).toBeVisible();

  const authorized = await context.request.get(privateUrl);
  await expect(authorized).toBeOK();
  expect(authorized.headers()["cache-control"]).toBe("private, no-store");
  expect(await authorized.json()).toEqual({
    message: expect.any(String),
    user: { id: expect.stringMatching(/.+/), name }
  });

  await account.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in\/?(?:\?|$)/);
  expect((await context.request.get(privateUrl)).status()).toBe(401);
});

test("includes migration files in the merged Node build", async () => {
  test.skip(process.env.PLAYWRIGHT_PRODUCTION_VARIANT !== "merged", "Only the merged Node build ships migrations.");
  const migrations = new URL("../.output/server/migrations/", import.meta.url);
  expect((await stat(migrations)).isDirectory()).toBe(true);
});
