import { expect, test } from "@playwright/test";

const NON_E2E_HTTP_URL = /^https?:\/\/(?!127\.0\.0\.1:3100(?:[/?#]|$))/;

test.beforeEach(async ({ page }) => {
  await page.route(NON_E2E_HTTP_URL, (route) => route.abort("blockedbyclient"));
});

test("renders the public home page", async ({ page }) => {
  const response = await page.goto("./");

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { name: "Your stack, redefined." })).toBeVisible();
});
