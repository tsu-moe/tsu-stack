# Route SEO

Use the [app SEO helper](../apps/web/src/shared/lib/seo.ts) in TanStack Start route `head()`. The app owns its typed site config, title template, locale defaults, default Open Graph image, and shell links. Keep `@tsu-stack/seo` env-independent.

- Give each public page its own title, description, and route-relative `alternates.canonicalPath`. Pass `params.locale` with alternates. Use loader data for dynamic metadata and resolve localized copy at request time. See [the terms route](<../apps/web/src/routes/{-$locale}/(root-layout)/terms-of-service/index.tsx>).
- Verify generated canonical URLs against the deployed base path. The starter helper currently resolves them from the origin, which can omit a mount prefix such as `/web`. Address subpath support in the shared helper when the task requires it.
- Use `robots: { index: false, follow: false }` for private or internal surfaces. Set `includeDocumentMeta: true` only in the root. Route metadata is explicit.
- Override images only when a page has a better asset. Let the app build any JSON-LD objects and pass scripts to the helper. The helper needs explicit locale and URL inputs. Robots and sitemap files belong to the app’s separate routes.
