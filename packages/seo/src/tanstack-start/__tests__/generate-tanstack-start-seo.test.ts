import { expect, it } from "vite-plus/test";

import { generateTanStackStartSeo } from "#@/tanstack-start/generate-tanstack-start-seo";

it.each([
  { basePath: undefined, prefix: "" },
  { basePath: "/web", prefix: "/web" },
  { basePath: "/products/web/", prefix: "/products/web" }
])("builds localized page URLs for mount $basePath", ({ basePath, prefix }) => {
  const baseUrl = "https://example.test";
  const basePage = `${baseUrl}${prefix}/terms`;
  const localizedPage = `${baseUrl}${prefix}/de/terms`;
  const head = generateTanStackStartSeo({
    alternates: { baseLocale: "en", canonicalPath: "/terms", locale: "de", locales: ["en", "de"] },
    site: { basePath, baseUrl, defaultTitle: "Example" }
  });

  expect(head.links).toEqual([
    { href: localizedPage, rel: "canonical" },
    { href: basePage, hrefLang: "en", rel: "alternate" },
    { href: localizedPage, hrefLang: "de", rel: "alternate" },
    { href: basePage, hrefLang: "x-default", rel: "alternate" }
  ]);
  expect(head.meta).toContainEqual({ content: localizedPage, property: "og:url" });
});

it("preserves a route's explicit crawler restrictions", () => {
  const head = generateTanStackStartSeo({
    robots: { index: false, follow: false, noarchive: true },
    site: { baseUrl: "https://example.test", defaultTitle: "Example" }
  });

  expect(head.meta).toEqual(
    expect.arrayContaining([
      { content: "noindex, nofollow, noarchive", name: "robots" },
      { content: "noindex, nofollow, noarchive", name: "googlebot" }
    ])
  );
});
