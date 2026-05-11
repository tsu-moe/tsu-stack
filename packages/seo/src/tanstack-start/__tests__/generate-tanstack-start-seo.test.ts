import { describe, expect, it } from "vitest";

import { generateTanStackStartSeo } from "#@/tanstack-start/generate-tanstack-start-seo";
import {
  type GenerateTanStackStartSeoParams,
  type TanStackStartSeoMetaTag,
  type TanStackStartSeoSite
} from "#@/tanstack-start/types";

const baseSite = {
  applicationName: "Example App",
  baseUrl: "https://example-app.example",
  defaultDescription: "Explore guides, builds, and featured articles.",
  defaultImages: [
    {
      alt: "Example App default social card",
      height: 630,
      type: "image/png",
      url: "/og/default.png",
      width: 1200
    }
  ],
  defaultTitle: "Example App",
  defaultTwitterCard: "summary_large_image",
  siteName: "Example App",
  titleTemplate: "%s | Example App",
  twitterCreator: "@example_creator",
  twitterSite: "@exampleapp"
} satisfies TanStackStartSeoSite;

function createSubject(overrides: Partial<GenerateTanStackStartSeoParams> = {}) {
  return generateTanStackStartSeo({
    site: baseSite,
    ...overrides
  });
}

function getMetaByName(meta: TanStackStartSeoMetaTag[] | undefined, name: string) {
  return meta?.find((tag) => "name" in tag && tag.name === name);
}

function getMetaByProperty(meta: TanStackStartSeoMetaTag[] | undefined, property: string) {
  return meta?.find((tag) => "property" in tag && tag.property === property);
}

function getAllMetaByProperty(meta: TanStackStartSeoMetaTag[] | undefined, property: string) {
  return meta?.filter(
    (tag): tag is Extract<TanStackStartSeoMetaTag, { property: string }> =>
      "property" in tag && tag.property === property
  );
}

function getTitle(meta: TanStackStartSeoMetaTag[] | undefined) {
  return meta?.find(
    (tag): tag is Extract<TanStackStartSeoMetaTag, { title: string }> => "title" in tag
  );
}

describe("generateTanStackStartSeo", () => {
  describe("happy path behavior", () => {
    it("builds a route head with templated titles, alternates, social meta, and robots tags", () => {
      const result = createSubject({
        alternates: {
          baseLocale: "en",
          canonicalPath: "/articles/legendary-builds/",
          locale: "ja",
          locales: ["en", "ja"] as const
        },
        description: "Legendary routes, builds, and pull planning.",
        images: [
          {
            alt: "Legendary builds banner",
            height: 720,
            type: "image/webp",
            url: "/og/articles/legendary-builds.webp",
            width: 1280
          }
        ],
        openGraphType: "article",
        robots: {
          follow: false,
          index: false,
          maxImagePreview: "large",
          noarchive: true
        },
        title: "Legendary Builds"
      });

      expect(getTitle(result.meta)).toEqual({
        title: "Legendary Builds | Example App"
      });
      expect(getMetaByName(result.meta, "description")).toEqual({
        content: "Legendary routes, builds, and pull planning.",
        name: "description"
      });
      expect(getMetaByProperty(result.meta, "og:title")).toEqual({
        content: "Legendary Builds | Example App",
        property: "og:title"
      });
      expect(getMetaByProperty(result.meta, "og:description")).toEqual({
        content: "Legendary routes, builds, and pull planning.",
        property: "og:description"
      });
      expect(getMetaByProperty(result.meta, "og:type")).toEqual({
        content: "article",
        property: "og:type"
      });
      expect(getMetaByProperty(result.meta, "og:url")).toEqual({
        content: "https://example-app.example/ja/articles/legendary-builds",
        property: "og:url"
      });
      expect(getMetaByProperty(result.meta, "og:locale")).toEqual({
        content: "ja",
        property: "og:locale"
      });
      expect(getMetaByProperty(result.meta, "og:site_name")).toEqual({
        content: "Example App",
        property: "og:site_name"
      });
      expect(getMetaByProperty(result.meta, "og:image")).toEqual({
        content: "https://example-app.example/og/articles/legendary-builds.webp",
        property: "og:image"
      });
      expect(getMetaByName(result.meta, "twitter:title")).toEqual({
        content: "Legendary Builds | Example App",
        name: "twitter:title"
      });
      expect(getMetaByName(result.meta, "twitter:image")).toEqual({
        content: "https://example-app.example/og/articles/legendary-builds.webp",
        name: "twitter:image"
      });
      expect(getMetaByName(result.meta, "robots")).toEqual({
        content: "noindex, nofollow, noarchive, max-image-preview:large",
        name: "robots"
      });
      expect(getMetaByName(result.meta, "googlebot")).toEqual({
        content: "noindex, nofollow, noarchive, max-image-preview:large",
        name: "googlebot"
      });
      expect(result.links).toEqual([
        {
          href: "https://example-app.example/ja/articles/legendary-builds",
          rel: "canonical"
        },
        {
          href: "https://example-app.example/articles/legendary-builds",
          hrefLang: "en",
          rel: "alternate"
        },
        {
          href: "https://example-app.example/ja/articles/legendary-builds",
          hrefLang: "ja",
          rel: "alternate"
        },
        {
          href: "https://example-app.example/articles/legendary-builds",
          hrefLang: "x-default",
          rel: "alternate"
        }
      ]);
    });
  });

  describe("fallback precedence and edge cases", () => {
    it.each([
      {
        expectedCanonical: "https://example-app.example/",
        expectedOgUrl: "https://example-app.example/",
        locale: "en",
        name: "base locale on root path omits the locale prefix",
        path: "/"
      },
      {
        expectedCanonical: "https://example-app.example/ja",
        expectedOgUrl: "https://example-app.example/ja",
        locale: "ja",
        name: "non-base locale on root path does not add a trailing slash",
        path: "/"
      },
      {
        expectedCanonical: "https://example-app.example/guides",
        expectedOgUrl: "https://example-app.example/guides",
        locale: "en",
        name: "canonical paths are normalized to remove trailing slashes",
        path: "/guides/"
      }
    ])("$name", ({ expectedCanonical, expectedOgUrl, locale, path }) => {
      const result = createSubject({
        alternates: {
          baseLocale: "en",
          canonicalPath: path as `/${string}`,
          locale,
          locales: ["en", "ja"] as const
        }
      });

      expect(result.links?.[0]).toEqual({
        href: expectedCanonical,
        rel: "canonical"
      });
      expect(getMetaByProperty(result.meta, "og:url")).toEqual({
        content: expectedOgUrl,
        property: "og:url"
      });
    });

    it("falls back to site defaults when title, description, and images are omitted", () => {
      const result = createSubject();

      expect(getTitle(result.meta)).toEqual({
        title: "Example App | Example App"
      });
      expect(getMetaByName(result.meta, "description")).toEqual({
        content: "Explore guides, builds, and featured articles.",
        name: "description"
      });
      expect(getMetaByProperty(result.meta, "og:image")).toEqual({
        content: "https://example-app.example/og/default.png",
        property: "og:image"
      });
      expect(getMetaByName(result.meta, "twitter:image")).toEqual({
        content: "https://example-app.example/og/default.png",
        name: "twitter:image"
      });
    });

    it("treats an empty images array as a request to use default images rather than disabling images", () => {
      const result = createSubject({
        images: [],
        title: "Articles"
      });

      expect(getMetaByProperty(result.meta, "og:image")).toEqual({
        content: "https://example-app.example/og/default.png",
        property: "og:image"
      });
      expect(getMetaByName(result.meta, "twitter:image")).toEqual({
        content: "https://example-app.example/og/default.png",
        name: "twitter:image"
      });
    });

    it("omits description tags entirely when neither a route nor site description exists", () => {
      const result = generateTanStackStartSeo({
        site: {
          baseUrl: "https://example-app.example",
          defaultTitle: "Example App"
        },
        title: "Minimal"
      });

      expect(getMetaByName(result.meta, "description")).toBeUndefined();
      expect(getMetaByProperty(result.meta, "og:description")).toBeUndefined();
      expect(getMetaByName(result.meta, "twitter:description")).toBeUndefined();
    });
  });

  describe("pathological inputs", () => {
    it("filters sparse scripts while preserving valid JSON-LD scripts in order", () => {
      const sparseScripts = [
        undefined,
        {
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Example App"
          }),
          type: "application/ld+json" as const
        },
        undefined,
        {
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Example Studio"
          }),
          type: "application/ld+json" as const
        }
      ] as unknown as NonNullable<GenerateTanStackStartSeoParams["scripts"]>;

      const result = createSubject({
        scripts: sparseScripts
      });

      expect(result.scripts).toEqual([
        {
          children: '{"@context":"https://schema.org","@type":"WebSite","name":"Example App"}',
          type: "application/ld+json"
        },
        {
          children:
            '{"@context":"https://schema.org","@type":"Organization","name":"Example Studio"}',
          type: "application/ld+json"
        }
      ]);
    });

    it("supports title templates without a %s placeholder by appending them consistently", () => {
      const result = generateTanStackStartSeo({
        site: {
          baseUrl: "https://example-app.example",
          defaultTitle: "Example App",
          titleTemplate: "| Example App"
        },
        title: "Profile"
      });

      expect(getTitle(result.meta)).toEqual({
        title: "Profile | Example App"
      });
      expect(getMetaByProperty(result.meta, "og:title")).toEqual({
        content: "Profile | Example App",
        property: "og:title"
      });
      expect(getMetaByName(result.meta, "twitter:title")).toEqual({
        content: "Profile | Example App",
        name: "twitter:title"
      });
    });

    it("uses the first resolved image for Twitter while retaining all Open Graph images", () => {
      const result = createSubject({
        images: [
          {
            alt: "Primary social image",
            url: "https://cdn.example.com/social/primary.png"
          },
          {
            alt: "Secondary social image",
            height: 900,
            type: "image/jpeg",
            url: "/social/secondary.jpg",
            width: 1600
          }
        ]
      });

      expect(getMetaByName(result.meta, "twitter:image")).toEqual({
        content: "https://cdn.example.com/social/primary.png",
        name: "twitter:image"
      });
      expect(getMetaByName(result.meta, "twitter:image:alt")).toEqual({
        content: "Primary social image",
        name: "twitter:image:alt"
      });
      expect(getAllMetaByProperty(result.meta, "og:image")).toEqual([
        {
          content: "https://cdn.example.com/social/primary.png",
          property: "og:image"
        },
        {
          content: "https://example-app.example/social/secondary.jpg",
          property: "og:image"
        }
      ]);
    });
  });

  describe("regression-prone SEO cases", () => {
    it("adds document meta only when explicitly requested at the root", () => {
      const withDocumentMeta = createSubject({
        includeDocumentMeta: true
      });
      const withoutDocumentMeta = createSubject({
        includeDocumentMeta: false
      });

      expect(withDocumentMeta.meta).toEqual(
        expect.arrayContaining([
          { charSet: "utf-8" },
          {
            content: "width=device-width, initial-scale=1",
            name: "viewport"
          },
          {
            content: "Example App",
            name: "application-name"
          },
          {
            content: "on",
            httpEquiv: "x-dns-prefetch-control"
          }
        ])
      );
      expect(withoutDocumentMeta.meta).not.toEqual(
        expect.arrayContaining([
          { charSet: "utf-8" },
          {
            content: "width=device-width, initial-scale=1",
            name: "viewport"
          }
        ])
      );
    });

    it("still emits og:locale even when alternates are not fully configured", () => {
      const result = createSubject({
        alternates: {
          canonicalPath: "/profile/search",
          locale: "ja"
        }
      });

      expect(result.links).toEqual([
        {
          href: "https://example-app.example/ja/profile/search",
          rel: "canonical"
        }
      ]);
      expect(getMetaByProperty(result.meta, "og:locale")).toEqual({
        content: "ja",
        property: "og:locale"
      });
    });

    it("serializes robots directives in a stable, crawler-friendly order", () => {
      const result = createSubject({
        robots: {
          maxImagePreview: "standard",
          noarchive: true,
          noimageindex: true,
          nosnippet: true
        }
      });

      expect(getMetaByName(result.meta, "robots")).toEqual({
        content: "index, follow, noarchive, noimageindex, nosnippet, max-image-preview:standard",
        name: "robots"
      });
      expect(getMetaByName(result.meta, "googlebot")).toEqual({
        content: "index, follow, noarchive, noimageindex, nosnippet, max-image-preview:standard",
        name: "googlebot"
      });
    });
  });

  describe("contract invariants", () => {
    it("never returns undefined entries in meta, links, or scripts arrays", () => {
      const sparseScripts = [
        undefined,
        { children: "{}", type: "application/ld+json" as const }
      ] as unknown as NonNullable<GenerateTanStackStartSeoParams["scripts"]>;

      const result = createSubject({
        alternates: {
          baseLocale: "en",
          canonicalPath: "/profile/search/",
          locale: "ja",
          locales: ["en", "ja"] as const
        },
        includeDocumentMeta: true,
        robots: {
          follow: false,
          index: false
        },
        scripts: sparseScripts
      });

      expect(result.meta?.every(Boolean)).toBe(true);
      expect(result.links?.every(Boolean)).toBe(true);
      expect(result.scripts?.every(Boolean)).toBe(true);
    });

    it("keeps document title, og:title, and twitter:title aligned for every title scenario", () => {
      const cases = [
        {
          expected: "Example App | Example App",
          name: "default title with template",
          title: undefined
        },
        {
          expected: "Profile Search | Example App",
          name: "custom title with template",
          title: "Profile Search"
        }
      ];

      for (const testCase of cases) {
        const result = createSubject({
          title: testCase.title
        });

        expect(getTitle(result.meta)?.title).toBe(testCase.expected);
        expect(getMetaByProperty(result.meta, "og:title")).toEqual({
          content: testCase.expected,
          property: "og:title"
        });
        expect(getMetaByName(result.meta, "twitter:title")).toEqual({
          content: testCase.expected,
          name: "twitter:title"
        });
      }
    });
  });
});
