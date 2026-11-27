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
