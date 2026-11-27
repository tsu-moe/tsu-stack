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

test("keeps the stock social buttons clickable and shows a toast for each provider", async ({ page }) => {
  await page.goto("sign-in");
  await expect(page.getByRole("heading", { name: "login or create your account." })).toBeVisible();

  const providers = ["Google", "Vercel", "GitHub"];
  const notifications = page.getByText("Not yet implemented.", { exact: true });
  for (const [index, provider] of providers.entries()) {
    const providerButton = page.getByRole("button", { name: `Continue with ${provider}` });
    await expect(providerButton).toBeEnabled();
    await providerButton.click();
    await expect(notifications).toHaveCount(index + 1);
  }
});

test("continues with email to the existing password form inside the deployment mount", async ({ baseURL, page }) => {
  await page.goto("sign-in");
  await page.getByRole("textbox", { name: "Email" }).fill("starter@example.com");
  await page.getByRole("button", { name: "Continue With Email" }).click();

  await expect(page).toHaveURL(new RegExp(new URL("sign-in/password", baseURL).pathname + "(?:\\?|$)"));
  await expect(page.getByLabel("Email")).toHaveValue("starter@example.com");
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
});
