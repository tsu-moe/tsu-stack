import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page, baseURL }) => {
  if (!baseURL) throw new Error("Set the Playwright baseURL in the web app config.");
  const origin = new URL(baseURL).origin;
  await page.route(/^https?:\/\//, (route) =>
    new URL(route.request().url()).origin === origin ? route.continue() : route.abort()
  );
});

test("renders the public home page", async ({ baseURL, page }) => {
  const response = await page.goto("./");

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new URL("./", baseURL).href);
});

test("preserves the deployment mount in localized home metadata", async ({ baseURL, page }) => {
  const response = await page.goto("de");
  const localizedUrl = new URL("de", baseURL).href;

  expect(response?.ok()).toBe(true);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", localizedUrl);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", localizedUrl);
  await expect(page.locator('link[rel="alternate"][hreflang="de"]')).toHaveAttribute("href", localizedUrl);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
    "href",
    new URL("./", baseURL).href
  );
});
