# Auth Patterns

## Architecture

- **Server**: Better Auth handles `/auth/*` on the Hono server (`apps/server`)
- **Client**: `authClient` from `@tsu-stack/auth` (nanostore-based, client-side only)
- **SSR**: `$getUser` server function resolves session from request headers, forwards `Set-Cookie` for refresh
- **Cookies**: Prefer Better Auth defaults for reusable projects — `SameSite=Lax` supports OAuth and other redirect-based flows without custom per-project overrides

## Query Pattern

Auth user query is defined in `@tsu-stack/auth`:

- `getAuthUserQueryOptions()` — staleTime 5 min, gcTime 10 min, refetchOnWindowFocus "always"
- Root route `beforeLoad` prefetches auth (non-blocking `prefetchQuery`)
- Auth-guarded routes use blocking `ensureQueryData`

## Route Guards

### Protected routes (`(auth)/` layout group)

- `beforeLoad` calls `ensureQueryData(getAuthUserQueryOptions())` with `revalidateIfStale: true`
- No user → redirects to `/sign-in?redirect=<current-path>`
- Client-side `useEffect` re-checks auth for session expiry

### Guest-only routes (`(guest)/` layout group)

- Authenticated users → redirected to stored redirect path
- `?redirect` param validated against route tree (sanitized)

## Middleware

Two auth middlewares exist for different sensitivity levels:

| Middleware            | Behavior                                 | Use case                                     |
| --------------------- | ---------------------------------------- | -------------------------------------------- |
| `authMiddleware`      | Uses cached session (5-min cookie cache) | Normal protected pages                       |
| `freshAuthMiddleware` | Hits DB, bypasses cache                  | Sensitive operations (password change, etc.) |

Both set 401 status and throw on unauthorized.

## Schema Extension

When extending the Better Auth `user` or `session` schema, update all three layers together:

- **Server auth config**: add the field under `additionalFields` in `packages/auth/src/index.ts`
- **Drizzle schema**: add the matching column in `packages/db/src/schema/auth.schema.ts`
- **Client inference**: keep `packages/auth/src/react/auth-client.ts` using `inferAdditionalFields<typeof auth>()` so custom fields stay typed on the client

For DB-backed auth fields, also generate and apply a Drizzle migration after the schema change.

## Gotchas

- Cross-domain auth setups still require deliberate cookie/domain/CORS configuration even with Better Auth defaults
- `SameSite=Strict` is usually too brittle for OAuth, email links, and other redirect-based auth flows
- The auth query uses `refetchOnWindowFocus: "always"` for cross-tab session sync
- Better Auth custom fields are not complete if you only add the DB column; the auth config and client inference must be updated too
- In this repo, keep the main Drizzle relation graph in `packages/db/src/schema/relations.ts` with `defineRelations()`. Auth tables may add their own `defineRelationsPart()` in `packages/db/src/schema/auth.schema.ts`, and that part must be merged after the main relations in `packages/db/src/index.ts`.
