import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page, baseURL }) => {
  if (!baseURL) throw new Error("Set the Playwright baseURL in the web app config.");
  const origin = new URL(baseURL).origin;
  await page.route(/^https?:\/\//, (route) =>
    new URL(route.request().url()).origin === origin ? route.continue() : route.abort()
  );
});

test("reaches sign-in and account creation from the public site", async ({ page }) => {
  const response = await page.goto("./");
  expect(response?.ok()).toBe(true);

  await page.getByRole("banner").getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in\/?(?:\?|$)/);
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Create one", exact: true }).click();
  await expect(page).toHaveURL(/\/create-an-account\/?(?:\?|$)/);
  await expect(page.getByLabel("Confirm Password", { exact: true })).toBeVisible();
});

test("redirects guests from protected pages", async ({ page }) => {
  await page.goto("dashboard");
  await expect(page).toHaveURL(/\/sign-in\/?\?/);
  expect(new URL(page.url()).searchParams.get("redirect")).toBe("/dashboard");
});

test("keeps auth return destinations on allowed app routes", async ({ page, baseURL }) => {
  for (const [requested, expected] of [
    ["/privacy-policy", "/privacy-policy"],
    ["https://example.test/terms-of-service", "/dashboard"],
    ["42", "/dashboard"]
  ] as const) {
    const signIn = new URL("sign-in", baseURL);
    signIn.searchParams.set("redirect", requested);
    await page.goto(signIn.href);

    const createAccount = await page.getByRole("link", { name: "Create one", exact: true }).getAttribute("href");
    expect(new URL(createAccount!, signIn).searchParams.get("redirect")).toBe(expected);
  }
});

test("keeps the public navbar usable while the mobile menu is open", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 850 });
  await page.goto("./");

  const header = page.getByRole("banner");
  const menu = header.getByRole("navigation", { name: "Navigation" });
  const preview = page.getByRole("img", { name: "Dashboard preview" });
  await expect(preview).toBeVisible();
  await expect.poll(() => preview.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  let toggle = header.getByRole("button", { name: "Toggle menu" });
  await toggle.press("Enter");
  await expect(menu).toBeVisible();
  await expect(page.getByRole("main")).toBeHidden();

  await header.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveClass(/\blight\b/);
  await expect(menu).toBeVisible();

  await menu.getByRole("button", { name: "Resources" }).focus();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(toggle).toBeFocused();
  await expect.poll(() => preview.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

  await toggle.click();
  await header.getByRole("button", { name: "Switch language" }).click();
  await page.getByRole("menuitemradio", { name: "Deutsch" }).click();
  await expect(page).toHaveURL(/\/de\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");

  await page.goBack();
  await expect(header.getByRole("button", { name: "Switch language" })).toBeVisible();
  await page.goForward();
  await expect(header.getByRole("button", { name: "Sprache wechseln" })).toBeVisible();

  toggle = header.getByRole("button", { name: "Menü öffnen oder schließen" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await menu.getByRole("link", { name: "Anmelden", exact: true }).click();
  await expect(page).toHaveURL(/\/de\/sign-in\/?(?:\?|$)/);
  await expect(page.getByLabel("E-Mail", { exact: true })).toBeVisible();
});

test("keeps legal navigation and content in the selected locale", async ({ page }) => {
  await page.route(/\.js(?:\?|$)/, (route) => route.abort());
  await page.goto("de");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("banner").getByRole("link", { name: "Anmelden", exact: true })).toBeVisible();
  const footer = page.getByRole("contentinfo");
  await footer.getByRole("link", { name: "Datenschutzrichtlinie" }).click();
  await expect(page).toHaveURL(/\/de\/privacy-policy\/?$/);
  await expect(page.getByRole("heading", { name: "Datenschutzrichtlinie", level: 1 })).toBeVisible();

  await footer.getByRole("link", { name: "Nutzungsbedingungen" }).click();
  await expect(page).toHaveURL(/\/de\/terms-of-service\/?$/);
  await expect(page.getByRole("heading", { name: "Nutzungsbedingungen", level: 1 })).toBeVisible();
});
