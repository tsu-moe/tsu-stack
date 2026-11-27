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
  const heroTitle = page.getByRole("heading", { level: 1 });
  await expect(heroTitle).toHaveText("A full-stack starter for TypeScript apps");
  await expect(heroTitle).toHaveCSS("text-shadow", "none");
  await expect(page.getByRole("img", { name: "Dashboard preview" })).toBeVisible();
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
    "href",
    new URL("dashboard", baseURL).pathname
  );
  await expect(footer.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
  const header = page.getByRole("banner");
  const main = page.getByRole("main");
  await expect(main.getByText("Get Started", { exact: true })).toHaveAttribute(
    "href",
    new URL("sign-in", baseURL).pathname
  );
  await expect(main).toHaveCSS("border-left-width", "1px");
  await expect(main).toHaveCSS("border-right-width", "1px");
  const headerWidth = (await header.boundingBox())?.width;
  expect(headerWidth).toBeDefined();
  expect((await main.boundingBox())?.width).toBe(headerWidth);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new URL("./", baseURL).href);
});

test("preserves the deployment mount in localized home metadata", async ({ baseURL, page }) => {
  const response = await page.goto("de");
  const localizedUrl = new URL("de", baseURL).href;

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Eine Full-Stack-Vorlage für TypeScript-Apps");
  await expect(page.getByRole("img", { name: "Dashboard-Vorschau" })).toBeVisible();
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "Nutzungsbedingungen" })).toHaveAttribute(
    "href",
    new URL("de/terms-of-service", baseURL).pathname
  );
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
  await expect(page.getByRole("heading", { name: "Sign in or create an account" })).toBeVisible();

  const providers = ["Google", "Apple", "GitHub"];
  const notifications = page.getByText("Not yet implemented.", { exact: true });
  for (const [index, provider] of providers.entries()) {
    const providerButton = page.getByRole("button", { name: `Continue with ${provider}` });
    await expect(providerButton).toBeEnabled();
    await providerButton.click();
    await expect(notifications).toHaveCount(index + 1);
  }
});

test("switches from sign-in options to the password and account forms", async ({ baseURL, page }) => {
  await page.goto("sign-in");
  const panel = page.getByRole("main");
  await expect(panel.getByText("Email", { exact: true })).toBeVisible();
  await expect(panel.getByRole("textbox", { name: "Email" })).toHaveCount(0);
  await panel.getByRole("button", { name: "Continue with email" }).click();

  await expect(page).toHaveURL(new RegExp(new URL("sign-in/password", baseURL).pathname + "(?:\\?|$)"));
  await expect(panel.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
  await expect(panel.getByLabel("Email")).toBeVisible();
  await expect(panel.getByLabel("Password", { exact: true })).toBeVisible();
  await panel.getByRole("link", { name: "Create a new account" }).click();

  await expect(page).toHaveURL(new RegExp(new URL("create-an-account", baseURL).pathname + "(?:\\?|$)"));
  await expect(panel.getByRole("heading", { name: "Create an account" })).toBeVisible();
  for (const name of ["Name", "Email", "Password", "Confirm Password"]) {
    await expect(panel.getByLabel(name, { exact: true })).toBeVisible();
  }
  await panel.getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(panel.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
});

test("renders localized auth copy and provider feedback", async ({ page }) => {
  await page.goto("de/sign-in");
  await expect(page.getByRole("heading", { name: "Anmelden oder Konto erstellen" })).toBeVisible();
  await expect(page.getByText("E-Mail", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mit GitHub fortfahren" }).click();
  await expect(page.getByText("Noch nicht implementiert.", { exact: true })).toBeVisible();
});
