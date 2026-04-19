# Auth Patterns

## Architecture

- **Server**: Better Auth handles `/auth/*` on the Hono server (`apps/server`)
- **Client**: `authClient` from `@tsu-stack/auth` (nanostore-based, client-side only)
- **SSR**: `$getUser` server function resolves session from request headers, forwards `Set-Cookie` for refresh
- **Cookies**: `sameSite: "strict"` in production — API and web **must** share the same host (path-based routing)

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

## Gotchas

- Auth cookies require same-host deployment — cross-origin setups **silently break** auth
- `sameSite` is `"none"` in dev (Safari ITP workaround), `"strict"` in production
- The auth query uses `refetchOnWindowFocus: "always"` for cross-tab session sync
