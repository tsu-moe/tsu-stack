# Auth Patterns

## Architecture

- **Server**: Better Auth handles `/auth/*` on the Hono server (`apps/server`)
- **Client**: `authClient` from `@tsu-stack/auth` (nanostore-based, client-side only)
- **SSR**: `$getUser` server function resolves session from request headers, forwards `Set-Cookie` for refresh
- **Cookies**: Prefer Better Auth defaults for reusable projects — `SameSite=Lax` supports OAuth and other redirect-based flows without custom per-project overrides

## Query Pattern

Auth user query is defined in `@tsu-stack/auth`:

- `getAuthUserQueryOptions()` — staleTime 5 min, gcTime 10 min, refetchOnWindowFocus "always"
- Root route `beforeLoad` warms auth with a handled, non-blocking `queryClient.query` call.
- Auth-guarded routes perform a blocking static cache read, then revalidate in the background with the query's normal freshness. Other loaders and components
  consume the same shared auth query rather than router loader context, so revalidation
  remains centralized in TanStack Query.

## Route Guards

### Protected routes (`(auth)/` layout group)

- `beforeLoad` calls `queryClient.query({ ...getAuthUserQueryOptions(), staleTime: "static" })`, then starts a handled background `queryClient.query(getAuthUserQueryOptions())`.
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

## Database Configuration

- Enable Drizzle joins through `advanced.database.joins`; the previous `experimental.joins` option is obsolete.
- Better Auth 1.7's generated account schema includes the provider issuer and its uniqueness constraint. Keep the generated schema as the source of truth instead of adding unsupported account options.
- `packages/db/src/schema/auth.schema.ts` is generated through the CLI-only `packages/auth/src/generate.ts` entrypoint by `vp run auth:generate`. Do not hand-edit it.
- Change Better Auth-owned fields through the auth config, regenerate the schema, inspect the diff, and keep the owning database's baseline migration consistent.

## Schema Extension

When extending the Better Auth `user` or `session` schema, update all three layers together:

- **Server auth config**: add the field under `additionalFields` in `packages/auth/src/index.ts`
- **Drizzle schema**: regenerate `packages/db/src/schema/auth.schema.ts`
- **Client inference**: keep `packages/auth/src/react/auth-client.ts` using `inferAdditionalFields<typeof auth>()` so custom fields stay typed on the client

For DB-backed auth fields, generate a SQLite migration, apply it locally, and inspect it before applying it to remote D1. Better Auth uses the `sqlite` Drizzle provider on this branch, with millisecond integer timestamps and SQLite boolean columns.

## Gotchas

- Cross-domain auth setups still require deliberate cookie/domain/CORS configuration even with Better Auth defaults
- `SameSite=Strict` is usually too brittle for OAuth, email links, and other redirect-based auth flows
- The auth query uses `refetchOnWindowFocus: "always"` for cross-tab session sync
- Better Auth custom fields are not complete if you only add the DB column; the auth config, generated schema, and client inference must be updated together.
- In this repo, keep the main Drizzle relation graph in `packages/db/src/schema/relations.ts` with `defineRelations()`. Auth tables may add their own `defineRelationsPart()` in `packages/db/src/schema/auth.schema.ts`, and that part must be merged after the main relations in `packages/db/src/index.ts`.
