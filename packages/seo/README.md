# @tsu-stack/seo

SEO helpers for TanStack Start route `head()` objects.

This package is intentionally small. It does not fetch data, inspect routes, or depend on `packages/env`. You pass it your site configuration and route-specific values, and it returns a TanStack Start-compatible head object.

## Public API

```ts
import {
  generateTanStackStartSeo,
  type GenerateTanStackStartSeoParams,
  type TanStackStartSeoAlternates,
  type TanStackStartSeoSite
} from "@tsu-stack/seo";
```

## What It Generates

`generateTanStackStartSeo(...)` can generate:

- `title`
- `description`
- Open Graph tags
- Twitter card tags
- canonical links
- alternate locale links
- `robots` and `googlebot` meta tags
- optional `application/ld+json` script tags
- optional root-only document meta such as `charset` and `viewport`

## Basic Setup

Define a typed site config in the consuming app:

```ts
import { type TanStackStartSeoSite } from "@tsu-stack/seo";

const site = {
  applicationName: "Example App",
  baseUrl: "https://example.com",
  defaultDescription: "An example application using route-level SEO helpers.",
  defaultImages: [
    {
      alt: "Example App",
      height: 630,
      type: "image/png",
      url: "https://example.com/og/index.png",
      width: 1200
    }
  ],
  defaultTitle: "Example App",
  siteName: "Example App",
  titleTemplate: "%s | Example App"
} satisfies TanStackStartSeoSite;
```

Then wrap the package in app-specific helpers if you want to inject locale defaults:

```ts
import {
  type GenerateTanStackStartSeoParams,
  generateTanStackStartSeo,
  type TanStackStartSeoAlternates
} from "@tsu-stack/seo";

type AppSeoOptions = Omit<GenerateTanStackStartSeoParams, "alternates" | "site"> & {
  alternates?: Omit<TanStackStartSeoAlternates, "baseLocale" | "locales">;
};

export function generateAppSeo({ alternates, ...options }: AppSeoOptions) {
  return generateTanStackStartSeo({
    ...options,
    alternates: alternates
      ? {
          ...alternates,
          baseLocale: appConfig.i18n.baseLocale,
          locales: appConfig.i18n.locales
        }
      : undefined,
    site
  });
}
```

## Common Use Cases

### Root Route

Use `includeDocumentMeta: true` only on the root route:

```ts
head: () =>
  generateAppSeo({
    includeDocumentMeta: true
  });
```

This adds `charset`, `viewport`, `application-name`, and `x-dns-prefetch-control` in addition to the normal SEO tags.

### Static Page

```ts
head: ({ params }) =>
  generateAppSeo({
    alternates: {
      canonicalPath: "/privacy-policy",
      locale: params.locale
    },
    description: "Read the privacy policy for Example App.",
    title: "Privacy Policy"
  });
```

### Dynamic Page

```ts
head: ({ loaderData, params }) =>
  generateAppSeo({
    alternates: {
      canonicalPath: `/articles/${params.slug}`,
      locale: params.locale
    },
    description: loaderData.article.summary ?? `Read ${loaderData.article.title} on Example App.`,
    images: loaderData.article.coverImage
      ? [
          {
            alt: loaderData.article.title,
            url: loaderData.article.coverImage
          }
        ]
      : undefined,
    openGraphType: "article",
    title: loaderData.article.title
  });
```

### Noindex Routes

Use this for auth flows, internal pages, dashboards, and search pages:

```ts
head: ({ params }) =>
  generateAppSeo({
    alternates: {
      canonicalPath: "/account",
      locale: params.locale
    },
    robots: {
      follow: false,
      index: false
    },
    title: "Account"
  });
```

### Passing JSON-LD Scripts

The package does not generate schema objects for you, but it will include prebuilt JSON-LD script tags:

```ts
head: () =>
  generateAppSeo({
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Example App"
        })
      }
    ]
  });
```

## Title Template Behavior

`titleTemplate` applies to:

- document title
- `og:title`
- `twitter:title`

If you pass `title: "Articles"` and `titleTemplate: "%s | Example App"`, the output title fields become `Articles | Example App`.

If you omit `title`, the package uses `site.defaultTitle`.

## Limitations

- This package only builds route `head()` objects. It does not configure `sitemap.xml`, `robots.txt`, prerendering, or SSR.
- It does not inspect route params, locale state, loader data, or env. The consuming app must pass those in.
- It does not add favicon, sitemap, stylesheet, preload, or other non-SEO links for you. Keep those in the app shell or route.
- `includeDocumentMeta` should only be used where you truly want root document tags. TanStack Start does not have Next.js-style metadata inheritance.
- JSON-LD support is pass-through only. You must provide the final serialized payload yourself.
- Canonical and alternate links are generated from `canonicalPath`, `baseUrl`, and locale config. If those inputs are wrong, the output URLs will also be wrong.
- The package assumes one site-level SEO config per consuming app. If you have multiple brands or hosts, build that branching in the app wrapper.

## Recommended Integration Pattern

In the consuming app, keep:

- one typed `site` object in a shared SEO module
- one `generateAppSeo(...)` wrapper that injects locale defaults
- root-only `includeDocumentMeta: true` in the root route
- route-specific `title`, `description`, `robots`, and `canonicalPath` in each route
