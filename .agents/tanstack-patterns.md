# TanStack Patterns

## Routing (Feature-Sliced Design)

The web app uses TanStack Start file-based routing. In this codebase, `routes/` acts as the FSD **app layer**.

### FSD Layers (top → bottom, imports only go down)

| Layer    | Dir         | Purpose                                              |
| -------- | ----------- | ---------------------------------------------------- |
| app      | `routes/`   | Thin wrappers: loaders, guards, component references |
| pages    | `pages/`    | Full page UI                                         |
| widgets  | `widgets/`  | Composite UI (layouts)                               |
| features | `features/` | User-facing capabilities (forms, navbar)             |
| entities | `entities/` | Domain objects                                       |
| shared   | `shared/`   | Utilities, providers, hooks — no business logic      |

### Segment structure

```
segment-name/
  index.ts       → Barrel (public API, only re-exports)
  ui/            → React components
  lib/           → Business logic, integrations
  utils/         → Pure helpers
  types/         → Zod schemas + inferred types
  hooks/         → Custom React hooks
  stores/        → Zustand stores
  api/           → TanStack Query queries and mutations
    queries.ts     → Query options factories
    mutations.ts   → Mutation factories
```

### Route hierarchy

- `{-$locale}/` — i18n locale prefix (optional param, base locale omits it)
- `(root-layout)/` — Navbar + Footer wrapper
- `(centered-layout)/` — Centered content wrapper
- `(auth)/` — Protected routes (auto-redirects to sign-in)
- `(guest)/` — Guest-only routes (auto-redirects authenticated users)

### Adding a route

1. Create page component in `pages/<name>/ui/<name>-page.tsx`, export via `pages/<name>/index.ts`
2. Create route in `routes/{-$locale}/(layout-group)/<name>/route.tsx`
3. Route file imports page component + wires `beforeLoad`/`loader` with query prefetching
4. Add i18n strings to `packages/i18n/messages/en.json` using `{page_name}__key` convention

## Data Fetching (TanStack Query)

All caching is via React Query — **not** the router's loader cache. `defaultPreloadStaleTime: 0` is intentional.

### Query options factory pattern (`queries.ts`)

```ts
export const thingQueryKeys = {
  all: ["thing"] as const,
  byId: (id: string) => ["thing", id] as const,
};

export function getThingQueryOptions(id: string) {
  return queryOptions({
    queryKey: thingQueryKeys.byId(id),
    queryFn: () => client.thing.getById({ id }),
    staleTime: 5 * 60 * 1000,
  });
}
```

### In route loaders — always `ensureQueryData`

```ts
await context.queryClient.ensureQueryData(getThingQueryOptions(id));
```

### Mutations (`mutations.ts`)

Same factory pattern. `onSuccess` → invalidate queries + toast. `onError` → error toast.

## i18n Navigation

All navigation **must** use wrappers from `@tsu-stack/i18n`:

- `<Link>` — auto-injects locale prefix (never use `@tanstack/react-router` Link)
- `useNavigate` — programmatic navigation with locale
- `redirect` — server-side redirects in `beforeLoad`/loaders

**Pitfall**: Do not manually include locale in paths — the wrapper handles it. Manual prefixes cause duplication (`/en/en/about`).

## i18n Keys

Convention: `{FEATURE_OR_PAGE}__{...MORE_SPECIFIC_IDENTIFIERS}`

Write English strings in `packages/i18n/messages/en.json` first. Examples:

- `home_page__hero_title`
- `auth__sign_in_title`
- `navbar__dashboard`

## oRPC Client

The oRPC client is **isomorphic**: server-side calls go in-process (no HTTP), client-side uses fetch with cookies. Access via:

- `client` — raw oRPC client
- `orpc` — TanStack Query utils (query options factories for oRPC procedures)

### Adding an API endpoint

Define a procedure in `packages/api/src/routers/`, compose into `appRouter`. The oRPC client and OpenAPI spec update automatically.

## Gotchas

- `defaultPreloadStaleTime: 0` is deliberate — caching lives in React Query, not the router
- Route files should be **thin** — just loaders + component references, no business logic
- Barrel files (`index.ts`) are the public API — import from segments via barrels, not internals
- Pathless layout routes (parenthesized dirs) group routes without changing URLs
