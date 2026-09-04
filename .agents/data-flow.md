# Data Flow

Use this when working with TanStack Start routes, Router lifecycle, Query-backed server data, mutations, and server boundaries. For slice-local oRPC wrappers, also read [API fetching patterns](./api-fetching-patterns.md).

## Docs Lookup

Use `vp run tanstack ... --json` for TanStack documentation lookup.

```sh
vp run tanstack libraries --json
vp run tanstack doc router framework/react/guide/data-loading --json
vp run tanstack doc query framework/react/overview --docs-version v5 --json
vp run tanstack search-docs "server functions" --library start --json
vp run tanstack search-docs "loaders" --library router --framework react --json
```

## Router and Query Responsibilities

TanStack Query is the source of truth for server-owned data. TanStack Router owns params, validated search state, redirects, and route lifecycle.

- Define reusable query-option factories and use the same options in loaders, `beforeLoad`, components, and cache updates.
- Include every query input in its key. Use `loaderDeps` for validated search values that affect a loader.
- Default non-critical data to component hooks with local pending/error UI or a deliberate Suspense boundary.
- Keep persistent nested-layout UI outside child pending boundaries so loading child content does not replace the parent shell.
- Warm only primary, high-value route data without blocking navigation. Keep secondary or speculative queries in component hooks.
- Prefer loaders for warming. Use `beforeLoad` for routing decisions such as auth redirects, or when work must begin before matched loaders.
- If data is required before rendering, await its query in a loader and subscribe to it from the component; do not mirror Query-owned data into loader data or Router context.
- Keep `defaultPreload: "intent"` for route bundles and `defaultPreloadStaleTime: 0` so Query, rather than Router, owns freshness.

Route files stay thin: route metadata, search validation, guards, query warming, and component wiring only. Put page UI in `pages/`, business logic in its owning slice, and query/mutation wiring in slice-local `api/` modules.

## Local Route Structure

In `apps/web`, `routes/` is the FSD app layer and imports only downward.

| Layer    | Directory   | Purpose                                        |
| -------- | ----------- | ---------------------------------------------- |
| app      | `routes/`   | Thin route wrappers, guards, and lifecycle     |
| pages    | `pages/`    | Full page UI                                   |
| widgets  | `widgets/`  | Composite layouts and sections                 |
| features | `features/` | User-facing capabilities                       |
| entities | `entities/` | Domain objects                                 |
| shared   | `shared/`   | Utilities and providers without business logic |

The locale and pathless layout hierarchy is:

- `{-$locale}/` — optional i18n locale prefix.
- `(root-layout)/` — navbar and footer.
- `(centered-layout)/` — centered content.
- `(auth)/` — protected routes.
- `(guest)/` — guest-only routes.

When adding a route, create its page in the owning slice, export it through the slice barrel, then add a thin route that wires metadata, validation, guards, warming, and the page component.

## `queryClient.query`

`queryClient.query` is the imperative, non-reactive API for loaders, `beforeLoad`, and callbacks. Components use Query hooks so they subscribe to cache updates.

- Missing cache: fetch and wait.
- Fresh cache: return cached data.
- Stale or invalidated cache: fetch and wait.
- `staleTime: "static"`: return cached data even when stale or invalidated; fetch only when missing.

Await routing- or render-critical queries so failures reach the route error boundary. Background warming must handle rejection:

```ts
import { noop } from "@tanstack/react-query";

loader: ({ context }) => {
  void context.queryClient.query(getThingQueryOptions()).catch(noop);
};
```

For stale-while-revalidate behavior, perform a static read and then revalidate with the reusable options' normal freshness:

```ts
const thing = await context.queryClient.query({
  ...getThingQueryOptions(),
  staleTime: "static"
});
void context.queryClient.query(getThingQueryOptions()).catch(noop);
```

Migration mapping from the deprecated methods:

| Deprecated call                                            | Replacement                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| `fetchQuery(options)`                                      | `query(options)`                                                    |
| `prefetchQuery(options)`                                   | `query(options).catch(noop)`                                        |
| `ensureQueryData(options)`                                 | `query({ ...options, staleTime: "static" })`                        |
| `ensureQueryData({ ...options, revalidateIfStale: true })` | Await a static read, then run a handled background `query(options)` |

Never use cached route data as the server-side authorization decision. Authorization and destructive-operation checks belong in server procedures, server functions, or middleware.

## Mutations

- Prefer one round trip: return canonical affected data and update exact caches that can be reconstructed safely.
- Update caches immutably from the server response rather than assumptions about stored data.
- Invalidate only affected aggregate or list caches that cannot be reconstructed safely.
- Use `router.invalidate()` only when route guards, redirects, or other route logic must rerun; use `{ sync: true }` when the next step depends on completion.
- Use optimistic updates only for reversible, predictable changes with cancellation, snapshots, rollback, and server reconciliation.
- Do not optimistically apply destructive, security-sensitive, identity-creating, or complex multi-entity mutations.

## Server Boundaries

- Route loaders are isomorphic. Keep database, filesystem, secrets, and other server-only work behind oRPC procedures, Start server functions, `createServerOnlyFn`, `*.server.*` modules, or the server-only import guard.
- Import Start server functions statically and prefix them with `$`.
- Forward the Query `signal` through the client wrapper to the server boundary.
- Do not use relative `fetch("/api/...")` calls from isomorphic loaders. Use the typed app boundary or construct an absolute URL inside an explicit server boundary when HTTP itself is required.

## Gotchas

- Barrel files are slice public APIs.
- Pathless layout directories group routes without changing URLs.
- Do not call React hooks from loaders or `beforeLoad`.
- Property order affects Router inference: validation and dependencies must precede consumers.
