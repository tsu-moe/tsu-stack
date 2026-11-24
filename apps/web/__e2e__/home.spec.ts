import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page, baseURL }) => {
  if (!baseURL) throw new Error("Set the Playwright baseURL in the web app config.");
  const origin = new URL(baseURL).origin;
  await page.route(/^https?:\/\//, (route) =>
    new URL(route.request().url()).origin === origin ? route.continue() : route.abort()
  );
});

test("renders the public home page", async ({ page }) => {
  const response = await page.goto("./");

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading").first()).toBeVisible();
});
