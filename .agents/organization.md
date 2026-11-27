# Project organization

The web app adapts Feature-Sliced Design to TanStack Start. Start a screen or user-facing capability in the page that needs it. Keep its UI, data access, state, and assets together until another consumer needs the same responsibility. Move the reusable part directly to the closest lower layer that serves both. Keep screen-specific composition and behavior in the page.

## Choose a layer

| Layer under `apps/web/src/` | Use it for                                                                  | Example                                                               |
| --------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `routes/`                   | Metadata, guards, search validation, loader wiring, and rendering the owner | Wire `DashboardPage` to the dashboard route.                          |
| `pages/`                    | A screen and everything it alone owns                                       | Keep the dashboard sidebar and search in `pages/dashboard`.           |
| `widgets/`                  | Reusable composed sections or layouts                                       | `SiteLayout` provides the header and footer for home and legal pages. |
| `features/`                 | Reusable user actions or capabilities                                       | The account menu handles sign-out on both the site and dashboard.     |
| `entities/`                 | A domain concept shared across independent capabilities                     | A user summary used by account and team features.                     |
| `shared/`                   | App-wide building blocks and infrastructure                                 | `CenteredLayout` centers both default error pages.                    |

Use `shared/` for pieces independent of a product workflow. Move a primitive to `packages/ui` when it can serve multiple apps without router, env, locale, or analytics dependencies.

Imports flow from `routes → pages → widgets → features → entities → shared`. Peer slices stay independent. Compose peers from a higher layer or extract just their common dependency. Import another slice through its `index.ts`. Use `./` for neighboring files and `@/` for other segments in the same slice or direct access to shared modules.

## Organize a slice

Create segments as needed. Use `ui/` for components, `api/` for remote requests and cache updates, `hooks/` for React behavior, `lib/` for logic and integrations, `utils/` for pure helpers, and `config/` for declarative settings. Use `types/` for schemas and types used across segments, `stores/` for Zustand state, `assets/` for media, and `content/` for authored material such as MDX.

- Use `*.query.ts` and `*.mutation.ts` for Query modules, and expose query options through the barrel when routes need them. Use `use-*.hook.ts`, `*.store.ts`, and `*.config.ts` for hooks, stores, and config.
- Keep single-use types with their consumer. Use `types/index.ts` for shared types or split by subject with `*.type.ts` filenames. Keep auth Zod schemas in `types/`, using `auth.types.ts` for one module or a subject name such as `credential-fields.type.ts`.
- Keep business state with its owner. When a store must coordinate across domains, keep typed Zustand `*.slice.ts` creators with those domains and compose them in `shared/stores/`.
- Keep media local, such as `pages/home/assets/carousel-logos/`, and move it to the closest common owner as reuse grows. Use `apps/web/public/img/<purpose>/` for broadly used images that need a public URL. Preserve established manifest, favicon, and Open Graph paths.

Keep app-wide settings in `apps/web/src/config/` and bootstrap entry points at the source root.

## Share contracts across packages

Use `packages/core/src/<domain>/` for contracts and pure logic used by multiple packages. Put schemas and inferred types in `types.ts`, support constants in `constants.ts`, pure helpers in `utils.ts`, and tests beside the domain. Export each domain through its `index.ts` and prefer domain subpaths such as `@tsu-stack/core/health`. Use `#@/` for internal modules.
