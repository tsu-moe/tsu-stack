# SEO Patterns

Use `@tsu-stack/seo` for TanStack Start route `head()` objects.

## Package Boundaries

- Keep `packages/seo` isolated from `packages/env`.
- Pass app-specific values from the consuming app.
- Do not expand the package surface casually. Export only what the app actually uses.
- Prefer `#@/` absolute imports inside `packages/seo`.

## App Pattern

- Define one typed site config with `satisfies TanStackStartSeoSite`.
- Wrap `generateTanStackStartSeo(...)` in an app helper like `generateAppSeo(...)`.
- Inject repo-specific locale defaults in the app wrapper, not in the package.
- Keep favicon, sitemap, stylesheet, and preload links in the app shell.

## Route Pattern

- Use route `head()` for page SEO, following TanStack Start docs.
- Pass a route-relative `canonicalPath` such as `"/articles"` or `` `/profile/${params.id}` ``.
- Pass `locale` from route params when building alternates.
- Use `loaderData` for dynamic titles, descriptions, and images.
- Use `robots: { index: false, follow: false }` for dashboards, auth pages, editors, and internal search pages.

## Root Route

- Use the same `generateAppSeo(...)` helper in `__root.tsx`.
- Only set `includeDocumentMeta: true` at the root.
- Do not rely on Next.js-style metadata inheritance. TanStack Start route heads are explicit per route.

## Titles And Images

- Prefer a site-level `titleTemplate` and let routes pass short page titles.
- Provide a site-level default Open Graph image in the app wrapper.
- Override `images` only when a route has a better page-specific image.

## JSON-LD

- The package can carry `application/ld+json` scripts, but it does not build schema objects for you.
- Keep schema generation explicit in the consuming app until there is a clear shared abstraction worth extracting.

## Limitations

- This package does not generate `robots.txt` or `sitemap.xml`.
- This package does not fetch data or infer locale automatically.
- Wrong `baseUrl`, `canonicalPath`, or locale inputs will produce wrong SEO output.
