# Project organization

The web app adapts Feature-Sliced Design to TanStack Start. Start a screen or user-facing capability in the page that needs it. Keep its UI, data access, state, and assets together until another consumer needs the same responsibility. Move the reusable part directly to the closest lower layer that serves both. Keep screen-specific composition and behavior in the page.

## Choose a layer

| Web layer   | Use it for                                                                  | Example                                                           |
| ----------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `routes/`   | Metadata, guards, search validation, loader wiring, and rendering the owner | Render a dashboard page from its route.                           |
| `pages/`    | A screen and everything it alone owns                                       | Keep a dashboard-only sidebar and search in its page.             |
| `widgets/`  | Reusable composed sections or layouts                                       | Share a header and footer across public pages.                    |
| `features/` | Reusable user actions or capabilities                                       | The account menu handles sign-out on both the site and dashboard. |
| `entities/` | A domain concept shared across independent capabilities                     | A user summary used by account and team features.                 |
| `shared/`   | App-wide building blocks and infrastructure                                 | Share a centering layout across error screens.                    |

Use `shared/` for pieces independent of a product workflow. Move a primitive to the workspace UI package when it can serve multiple apps without router, env, locale, or analytics dependencies.

Imports flow from `routes → pages → widgets → features → entities → shared`. Peer slices stay independent. Compose peers from a higher layer or extract just their common dependency. Import another slice through its `index.ts`. Use `./` for neighboring files and `@/` for other segments in the same slice or direct access to shared modules.

## Organize a slice

Create segments as needed. Use `ui/` for components, `api/` for remote requests and cache updates, `hooks/` for React behavior, `lib/` for logic and integrations, `utils/` for pure helpers, and `config/` for declarative settings. Use `types/` for schemas and types used across segments, `stores/` for Zustand state, `assets/` for media, and `content/` for authored material such as MDX.

- Use `*.query.ts` and `*.mutation.ts` for Query modules, and expose query options through the barrel when routes need them. Use `use-*.hook.ts`, `*.store.ts`, and `*.config.ts` for hooks, stores, and config.
- Keep single-use types with their consumer. Use `types/index.ts` for shared types or split by subject with `*.type.ts` filenames. Keep auth Zod schemas in `types/`. Name a single module `<slice>.types.ts` or split by subject with `<subject>.type.ts`.
- Keep business state with its owner. When a store must coordinate across domains, keep typed Zustand `*.slice.ts` creators with those domains and compose them in `shared/stores/`.
- Keep media in the owner’s `assets/` directory and move it to the closest common owner as reuse grows. Use `public/img/<purpose>/` for broadly used images that need a public URL. Preserve established manifest, favicon, and Open Graph paths.

Keep app-wide settings in the app’s top-level `config/` segment and bootstrap entry points at the source root.

## Share contracts across packages

Group contracts and pure logic used by multiple packages into domains in the core package. Put schemas and inferred types in `types.ts`, support constants in `constants.ts`, pure helpers in `utils.ts`, and tests beside the domain. Export each domain through its `index.ts` and prefer domain subpaths. Use the package’s configured internal alias for private modules.
