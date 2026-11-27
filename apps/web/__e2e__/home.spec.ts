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
  const hero = page.getByRole("region", { name: "A full-stack starter for TypeScript apps" });
  const heroTitle = hero.getByRole("heading", { level: 1 });
  await expect(heroTitle).toHaveText("A full-stack starter for TypeScript apps");
  await expect(heroTitle).toHaveCSS("text-align", "center");
  await expect(heroTitle).toHaveCSS("text-shadow", "none");
  await expect(page.getByRole("link", { name: "v1.0 Release" })).toHaveAttribute("href", "#stack");
  await expect(hero.getByRole("img", { name: "Dashboard preview" })).toBeVisible();
  const stackLogos = page.getByRole("region", { name: "What’s in the stack" });
  await expect(stackLogos.getByRole("list")).toHaveText("");
  await expect(stackLogos.getByRole("listitem")).toHaveCount(6);
  for (const name of ["Vite+", "TypeScript", "TanStack", "Drizzle", "PostgreSQL", "Better Auth"]) {
    const wordmark = stackLogos.getByRole("img", { name, exact: true });
    await expect(wordmark).toBeVisible();
    await expect(wordmark).toHaveJSProperty("complete", true);
    await expect(wordmark).not.toHaveJSProperty("naturalWidth", 0);
  }
  const testimonials = page.getByRole("region", { name: "Testimonials" });
  await expect(testimonials.getByText("Sample quotes paired with stock portraits.")).toBeVisible();
  await expect(testimonials.getByRole("figure")).toHaveCount(6);
  for (const figure of await testimonials.getByRole("figure").all()) {
    const avatar = figure.locator("img");
    await expect(avatar).toHaveJSProperty("complete", true);
    await expect(avatar).not.toHaveJSProperty("naturalWidth", 0);
  }
  await expect(page.getByRole("heading", { name: "The foundations are already connected" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Explore the starter" })).toHaveCount(0);
  const footer = page.getByRole("contentinfo");
  const footerNav = footer.getByRole("navigation", { name: "Footer" });
  await expect(footerNav.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
    "href",
    new URL("dashboard", baseURL).pathname
  );
  await expect(footerNav.getByRole("heading")).toHaveCount(3);
  await expect(footer.getByRole("textbox")).toHaveCount(0);
  await expect(footer.getByText(/©/)).toHaveCount(0);
  const start = page.getByRole("region", { name: "Start Building Today" });
  await expect(start.getByRole("link", { name: "View Documentation" })).toBeVisible();
  await expect(start.locator("pre")).toHaveCount(0);
  const main = page.getByRole("main");
  await expect(hero.getByRole("link", { name: "Get Started", exact: true })).toHaveAttribute(
    "href",
    new URL("sign-in", baseURL).pathname
  );
  await expect(main).toHaveCSS("border-left-width", "0px");
  await expect(main).toHaveCSS("border-right-width", "0px");
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect((await main.boundingBox())?.width).toBe(viewportWidth);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new URL("./", baseURL).href);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await expect(footer.getByRole("link", { name: "Terms of Service" })).toBeVisible();
});

test("aligns homepage sections and footer content with the header at each gutter size", async ({ page }) => {
  await page.goto("./");
  const header = page.getByRole("banner").locator(":scope > div");
  const footer = page.getByRole("contentinfo").locator(":scope > div");
  const sections = page.getByRole("main").locator(":scope > div > section");
  await expect(sections).toHaveCount(6);

  for (const [width, gutter] of [
    [1440, 208],
    [768, 32],
    [390, 16]
  ]) {
    await page.setViewportSize({ width, height: 900 });
    const edge = await header.evaluate((el) => {
      const { x, width } = el.getBoundingClientRect();
      return { x, width };
    });
    expect(edge).toEqual({ x: gutter, width: width - 2 * gutter });
    expect(await footer.boundingBox()).toMatchObject(edge);
    for (const section of await sections.all()) {
      expect(await section.boundingBox()).toMatchObject(edge);
      await expect(section).toHaveCSS("padding-inline-start", "0px");
      await expect(section).toHaveCSS("padding-inline-end", "0px");
    }
  }
});

test("pauses the homepage marquees on hover and shows the logos with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  const stack = page.getByRole("region", { name: "What’s in the stack" });
  const testimonials = page.getByRole("region", { name: "Testimonials" });
  await expect(stack.getByRole("button")).toHaveCount(0);
  await expect(testimonials.getByRole("button")).toHaveCount(0);
  const logoTrack = stack.locator('[data-slot="marquee-track"]');
  const testimonialTracks = testimonials.locator('[data-slot="marquee-track"]');
  await expect(logoTrack).toHaveCSS("animation-name", "tw-marquee-left");
  await expect(testimonialTracks.nth(0)).toHaveCSS("animation-name", "tw-marquee-left");
  await expect(testimonialTracks.nth(1)).toHaveCSS("animation-name", "tw-marquee-right");
  await stack.locator('[data-slot="marquee"]').hover();
  await expect(logoTrack).toHaveCSS("animation-play-state", "paused");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(logoTrack).toHaveCSS("animation-name", "none");
  const logos = stack.getByRole("list");
  await logos.scrollIntoViewIfNeeded();
  await expect(logos.getByRole("img", { name: "Better Auth" })).toBeInViewport();
});

test("opens FAQ answers before the start-building section", async ({ page }) => {
  await page.goto("./");
  const faq = page.getByRole("region", { name: "Frequently asked questions" });
  const about = faq.getByRole("button", { name: "What is tsu!stack?" });
  const included = faq.getByRole("button", { name: "What comes configured?" });
  await expect(faq.getByRole("button")).toHaveCount(6);
  await expect(faq.getByRole("link", { name: "Ask on GitHub" })).toHaveAttribute("href", /\/issues$/);
  await expect(about).toHaveAttribute("aria-expanded", "true");
  await expect(faq.getByText(/brings the web app, API, and database together/)).toBeVisible();
  await included.press("Enter");
  await expect(about).toHaveAttribute("aria-expanded", "false");
  await expect(included).toHaveAttribute("aria-expanded", "true");
  await expect(faq.getByText(/Better Auth for sign-in and sessions/)).toBeVisible();
  await expect(faq.locator("xpath=following-sibling::section[1]")).toHaveAccessibleName("Start Building Today");
});

test("toggles the theme from the header and with D without capturing text input", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.goto("./");
  const themeControl = page.getByRole("banner").getByRole("button", { name: "Toggle theme" });
  const root = page.locator("html");
  await expect(themeControl).toHaveAttribute("aria-keyshortcuts", "D");
  await expect(page.getByRole("contentinfo").getByRole("button", { name: "Toggle theme" })).toHaveCount(0);
  await expect(root).toHaveClass("dark");
  await themeControl.click();
  await expect(root).toHaveClass("light");
  await page.keyboard.press("d");
  await expect(root).toHaveClass("dark");

  await page.evaluate(() => {
    const input = document.createElement("input");
    input.setAttribute("aria-label", "Theme shortcut test");
    document.body.append(input);
    input.focus();
  });
  await page.keyboard.press("d");
  await expect(page.getByRole("textbox", { name: "Theme shortcut test" })).toHaveValue("d");
  await expect(root).toHaveClass("dark");
});

test("keeps the theme switcher before Sign in and renders Sign in as a keyboard-accessible link", async ({
  baseURL,
  page
}) => {
  await page.goto("./");
  const header = page.getByRole("banner");
  const signIn = header.getByRole("link", { name: "Sign in", exact: true });
  const themeControl = header.getByRole("button", { name: "Toggle theme" });
  await expect(signIn).toHaveAttribute("data-slot", "button");
  await themeControl.focus();
  await page.keyboard.press("Tab");
  await expect(signIn).toBeFocused();

  await page.keyboard.press("Space");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await expect(page).toHaveURL(new URL("./", baseURL).href);

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL((url) => url.pathname === new URL("sign-in", baseURL).pathname);
});

test("shows a native avatar menu for signed-in visitors and restores guest actions after sign-out", async ({
  baseURL,
  page
}) => {
  const origin = new URL("./", baseURL).origin;
  const user = {
    id: "test-user",
    name: "Test User",
    email: "test@example.com",
    image: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M0 0h32v32H0z" fill="orange"/></svg>')}`
  };
  let signedIn = true;
  await page.route("**/_serverFn/**", (route) => route.fulfill({ json: { result: signedIn ? user : null } }));
  await page.route("**/auth/sign-out", (route) => {
    const headers = {
      "access-control-allow-origin": origin,
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "POST",
      "access-control-allow-headers": "content-type"
    };
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    signedIn = false;
    return route.fulfill({ json: { success: true }, headers });
  });

  await page.goto("./");
  const header = page.getByRole("banner");
  const account = header.getByRole("button", { name: "Open account menu" });
  await expect(account).toHaveJSProperty("tagName", "BUTTON");
  await expect(account).toHaveAttribute("data-variant", "ghost");
  await expect(account.locator('[data-slot="avatar-image"]')).toHaveAttribute("src", user.image);
  await expect(header.getByRole("link", { name: /^(Sign in|Get Started)$/ })).toHaveCount(0);

  await account.focus();
  await page.keyboard.press("Enter");
  const accountMenu = page.getByRole("menu");
  await expect(accountMenu.getByText(user.name)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(account).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(account).toBeVisible();
  await header.getByRole("button", { name: "Toggle menu" }).click();
  const mobileMenu = page.getByRole("dialog", { name: "Navigation" });
  await expect(mobileMenu).toBeVisible();
  await expect(mobileMenu.getByRole("link", { name: /^(Sign in|Get Started)$/ })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(mobileMenu).toBeHidden();

  await account.click();
  await accountMenu.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(account).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(header.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();
});

test("matches desktop navigation heights and opens the mobile accordion menu", async ({ baseURL, page }) => {
  await page.goto("./");
  const header = page.getByRole("banner");
  const source = header.getByRole("link", { name: "Source code" });
  const stack = header.getByRole("button", { name: "Stack", exact: true });
  const resources = header.getByRole("button", { name: "Resources", exact: true });
  const heights = await Promise.all(
    [source, stack, resources].map((item) => item.evaluate((el) => el.getBoundingClientRect().height))
  );
  expect(new Set(heights).size).toBe(1);
  expect(heights[0]).toBeGreaterThan(0);

  await stack.hover();
  await expect(page.getByText("Foundations", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /See the request path/ })).toHaveAttribute(
    "href",
    `${new URL("./", baseURL).pathname}#request-path`
  );
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 390, height: 844 });
  const toggle = header.getByRole("button", { name: "Toggle menu" });
  await toggle.click();
  const menu = page.getByRole("dialog", { name: "Navigation" });
  await menu.getByRole("button", { name: "Stack", exact: true }).click();
  const webFramework = menu.getByRole("link", { name: /Web framework/ });
  await expect(webFramework).toBeVisible();
  await webFramework.click();
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/#stack$/);
});

test("shares the homepage header, footer, and responsive width across legal routes", async ({ baseURL, page }) => {
  const header = page.getByRole("banner");
  const article = page.getByRole("article");
  const footer = page.getByRole("contentinfo");
  const documents = [
    { path: "privacy-policy", title: "Privacy Policy", width: 1440 },
    { path: "terms-of-service", title: "Terms of Service", width: 390 }
  ];

  for (const { path, title, width } of documents) {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    await expect(article.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(header.getByRole("button", { name: "Toggle theme" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new URL(path, baseURL).href);
    const edge = width >= 1024 ? { x: 208, width: 1024 } : { x: 16, width: 358 };
    expect(await header.locator(":scope > div").boundingBox()).toMatchObject(edge);
    expect(await article.boundingBox()).toMatchObject(edge);
    expect(await footer.locator(":scope > div").boundingBox()).toMatchObject(edge);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }

  await page.goto("de/privacy-policy");
  await footer.getByRole("link", { name: "Nutzungsbedingungen" }).click();
  await expect(page).toHaveURL(new URL("de/terms-of-service", baseURL).href);
  await expect(article.getByRole("heading", { level: 1 })).toHaveText("Terms of Service");
  await footer.locator('a[href$="#stack"]').click();
  await expect(page).toHaveURL((url) => url.pathname === new URL("de", baseURL).pathname && url.hash === "#stack");
  await expect(page.locator("#stack")).toBeInViewport();
});

test("preserves the deployment mount in localized home metadata", async ({ baseURL, page }) => {
  const response = await page.goto("de");
  const localizedUrl = new URL("de", baseURL).href;

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Eine Full-Stack-Vorlage für TypeScript-Apps");
  await expect(page.getByRole("img", { name: "Dashboard-Vorschau" })).toBeVisible();
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Nutzungsbedingungen" })).toHaveAttribute(
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
  await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();

  const providers = ["Google", "Apple", "GitHub"];
  await expect(page.getByRole("button", { name: /^Continue with / })).toHaveText(
    providers.map((provider) => `Continue with ${provider}`)
  );
  const notifications = page.getByText("Not yet implemented.", { exact: true });
  for (const [index, provider] of providers.entries()) {
    const providerButton = page.getByRole("button", { name: `Continue with ${provider}` });
    await expect(providerButton).toBeEnabled();
    await providerButton.click();
    await expect(notifications).toHaveCount(index + 1);
  }
});

test("switches between the email sign-in and account forms in the same auth layout", async ({ baseURL, page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("sign-in?redirect=%2Fprivacy-policy");
  const panel = page.getByRole("main");
  const animatedPanel = panel.getByRole("heading", { level: 1 }).locator("..");
  const legalText = panel.locator("footer").getByText(/^By continuing, you agree to our/);
  const preview = panel.locator(".home-color-panel");
  await expect(panel.getByRole("button", { name: "Back", exact: true })).toHaveCount(0);
  await expect(legalText).toHaveCSS("font-size", "12px");
  await expect(legalText).toHaveCSS("text-align", "center");
  await expect(legalText.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
    "href",
    new URL("privacy-policy", baseURL).pathname
  );
  await expect(preview.locator("[data-card-variant=inset]")).toBeVisible();
  const desktopPreview = await preview.elementHandle();

  await expect(panel.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
  await expect(animatedPanel).toHaveCSS("animation-name", "enter");
  await expect(panel.getByText("or", { exact: true })).toBeVisible();
  await expect(panel.getByLabel("Email")).toBeVisible();
  await expect(panel.getByLabel("Password", { exact: true })).toBeVisible();
  await panel.getByRole("link", { name: "Create one" }).click();

  await expect(page).toHaveURL(
    (url) =>
      url.pathname === new URL("create-an-account", baseURL).pathname &&
      url.searchParams.get("redirect") === "/privacy-policy"
  );
  await expect(panel.getByRole("heading", { name: "Create an account" })).toBeVisible();
  expect(await desktopPreview.evaluate((element) => element.isConnected)).toBe(true);
  for (const name of ["Name", "Email", "Password", "Confirm Password"]) {
    await expect(panel.getByLabel(name, { exact: true })).toBeVisible();
  }
  await expect(animatedPanel).toHaveCSS("animation-name", "enter");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(animatedPanel).toHaveCSS("animation-name", "none");
  await panel.getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === new URL("sign-in", baseURL).pathname && url.searchParams.get("redirect") === "/privacy-policy"
  );
  await expect(panel.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(preview).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  expect(await legalText.evaluate((element) => element.getBoundingClientRect().bottom)).toBeCloseTo(820);
  await page.goBack();
  await expect(panel.getByRole("heading", { name: "Create an account" })).toBeVisible();
  await page.goBack();
  await expect(panel.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
  await panel.getByRole("link", { name: /tsu!stack/i }).click();
  await expect(page).toHaveURL(new URL("./", baseURL).href);
});

test("renders localized auth copy and provider feedback", async ({ baseURL, page }) => {
  await page.goto("de/sign-in");
  await expect(page.getByRole("heading", { name: "Bei Ihrem Konto anmelden" })).toBeVisible();
  await expect(page.getByLabel("E-Mail")).toBeVisible();
  await page.getByRole("button", { name: "Mit GitHub fortfahren" }).click();
  await expect(page.getByText("Noch nicht implementiert.", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /tsu!stack/i }).click();
  await expect(page).toHaveURL(new RegExp(new URL("de", baseURL).pathname + "/?$"));
});
