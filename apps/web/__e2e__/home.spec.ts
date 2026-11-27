import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page, baseURL }) => {
  if (!baseURL) throw new Error("Set the Playwright baseURL in the web app config.");
  const origin = new URL(baseURL).origin;
  await page.route(/^https?:\/\//, (route) =>
    new URL(route.request().url()).origin === origin ? route.continue() : route.abort()
  );
});

test("opens the auth forms from home", async ({ page }) => {
  const response = await page.goto("./");
  expect(response?.ok()).toBe(true);

  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { level: 1 })).toBeVisible();
  await main.getByRole("link", { name: "Get Started", exact: true }).first().click();

  await expect(page).toHaveURL(/\/sign-in(?:\?|$)/);
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Create one", exact: true }).click();
  await expect(page).toHaveURL(/\/create-an-account(?:\?|$)/);
  await expect(page.getByLabel("Confirm Password", { exact: true })).toBeVisible();
});

test("redirects guests from protected pages", async ({ page }) => {
  await page.goto("dashboard");
  await expect(page).toHaveURL(/\/sign-in\?/);
  expect(new URL(page.url()).searchParams.get("redirect")).toBe("/dashboard");
});

test("opens the legal pages from the footer", async ({ page }) => {
  await page.goto("./");
  const footer = page.getByRole("contentinfo");
  await footer.getByRole("link", { name: "Privacy Policy" }).click();
  await expect(page.getByRole("heading", { name: "Privacy Policy", level: 1 })).toBeVisible();
  await footer.getByRole("link", { name: "Terms of Service" }).click();
  await expect(page.getByRole("heading", { name: "Terms of Service", level: 1 })).toBeVisible();
});

test("shows the header divider only when scrolled", async ({ page }) => {
  await page.goto("./");
  const header = page.getByRole("banner");
  const transparent = "rgba(0, 0, 0, 0)";
  await expect(header).toHaveCSS("border-bottom-color", transparent);
  await page.evaluate(() => window.scrollTo(0, 160));
  await expect(header).not.toHaveCSS("border-bottom-color", transparent);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).toHaveCSS("border-bottom-color", transparent);
});

test("rotates setup steps while hovered and keeps the terminal in sync", async ({ page }) => {
  await page.goto("./");
  const setup = page.getByRole("region", { name: "Setting up is easy From CLI to localhost." });
  const scaffold = setup.getByRole("button", { name: "Create your project" });
  await scaffold.scrollIntoViewIfNeeded();
  const configure = setup.getByRole("button", { name: "Review your local environment" });
  const steps = setup.locator('[data-slot="accordion"]');
  const display = setup.locator('[data-slot="setup-display"]');
  const progress = setup.locator('[data-slot="setup-step-progress"]');
  await expect(scaffold).toHaveAttribute("aria-expanded", "true");
  await expect(steps.locator('[data-slot="accordion-item"]').first()).toHaveCSS("border-top-width", "0px");
  await expect
    .poll(async () => {
      const [stepsBox, displayBox] = await Promise.all([steps.boundingBox(), display.boundingBox()]);
      return Math.abs((stepsBox?.height ?? 0) - (displayBox?.height ?? 0));
    })
    .toBeLessThan(1);
  await expect(progress).toHaveCSS("animation-play-state", "running");
  await scaffold.hover();
  await expect(progress).toHaveCSS("animation-play-state", "running");
  await expect(configure).toHaveAttribute("aria-expanded", "true", { timeout: 10_000 });
  await expect(setup.getByText("my-app/packages/env/.env", { exact: true })).toBeVisible();

  await setup.getByRole("button", { name: "Run the dev servers" }).click();
  await expect(setup.getByText("vp run dev", { exact: true })).toBeVisible();
  await expect(progress).toHaveCount(0);
});

test("keeps reduced-motion setup steps manual and shows the WebGL fallback", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 850 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const getContext = Reflect.get(
      HTMLCanvasElement.prototype,
      "getContext"
    ) as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = new Proxy(getContext, {
      apply(target, canvas, args) {
        return typeof args[0] === "string" && args[0].startsWith("webgl") ? null : Reflect.apply(target, canvas, args);
      }
    });
  });
  await page.goto("./");

  const heroBackground = page.getByRole("main").locator(".ogl-background").first();
  await expect(heroBackground).toBeVisible();
  await expect(heroBackground).toHaveCSS("background-color", "rgb(163, 78, 53)");
  await expect(heroBackground.locator("canvas")).toHaveCount(0);

  const setup = page.getByRole("region", { name: "Setting up is easy" });
  await expect(setup.getByRole("button")).toHaveCount(3);
  await expect(setup.locator('[data-slot="setup-step-progress"]')).toBeHidden();
  await expect(setup.getByRole("button", { name: "Create your project" })).toHaveAttribute("aria-expanded", "true");
  const command = setup.locator("pre").first();
  await expect(command).toHaveCSS("white-space", "pre-wrap");
  expect(await command.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await setup.getByRole("button", { name: "Run the dev servers" }).focus();
  await page.keyboard.press("Enter");
  await expect(setup.getByText("vp run dev", { exact: true })).toBeVisible();
});
