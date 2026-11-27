# Web routes and data flow

TanStack Router owns params, validated search, guards, and navigation. TanStack Query owns server data and its freshness. Use the installed Intent skills or `vp run tanstack search-docs "<topic>" --library <library> --json` for TanStack docs.

## Routes

- Place public app pages under the current optional locale and root layout, like the [terms route](<../apps/web/src/routes/{-$locale}/(root-layout)/(legal-layout)/terms-of-service/index.tsx>). Pathless layout groups retain the public URL. Follow [Auth](auth.md) for protected and guest routes, [i18n](i18n.md) for navigation and copy, and [SEO](seo.md) for route metadata.
- Regenerate the tracked route tree with the app’s TanStack Router generation when adding or moving routes. Check base and localized URLs. Keep existing prerender policy unless the route needs an explicit change.

## Reads

- Use one query options factory for loaders and subscribing components. Put all inputs in the query key and use `loaderDeps` for validated search inputs. Place validation/deps before consumers in the route definition.
- Start secondary queries in components with local pending/error UI or a Suspense boundary. Keep persistent layout UI outside the child’s pending boundary.
- Warm primary route data in the loader when useful. Reserve `beforeLoad` for guards and work that must start before loaders. Use `void queryClient.query(options).catch(noop)` for background warming. Await `queryClient.query(options)` when rendering or navigation depends on the result. Query hooks subscribe in React. Keep server data out of loader state and Router context.
- Ordinary `query()` returns fresh cached data or fetches and waits. For a deliberate stale-while-revalidate flow, await `query({ ...options, staleTime: "static" })` then run the normal query with handled rejection. Static reads fetch only on a cache miss, including after invalidation. Auth guards use this for navigation, while server auth checks remain authoritative.
- Keep router `defaultPreload: "intent"` and `defaultPreloadStaleTime: 0`. If a prerenderable query needs finite browser `gcTime`, use `environmentManager.isServer() ? Infinity : browserGcTime` so a server GC timer cannot keep the build alive. Leave the default alone for other queries.

## Writes and boundaries

Return canonical mutation data when feasible. Update reconstructable caches immutably and invalidate affected caches that need a refetch. Invalidate the Router only to rerun route logic, with `{ sync: true }` when the next step depends on completion. Use optimistic updates only for reversible, predictable changes with cancellation, rollback, and reconciliation.

Loaders are isomorphic. Put secrets, database, filesystem, and authorization checks behind oRPC, Start server functions, or explicit server-only modules. Statically import Start server functions with a `$` prefix. Forward Query’s abort signal through the client. For HTTP from an isomorphic path, use a typed boundary or construct an absolute URL in a server-only module.
