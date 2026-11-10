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

## Middleware And Procedures

TanStack Start middleware and oRPC procedures each have cached and fresh-session variants:

| Surface        | Cached session          | Fresh database session        |
| -------------- | ----------------------- | ----------------------------- |
| TanStack Start | `authMiddleware`        | `freshAuthMiddleware`         |
| oRPC           | `protectedProcedure`    | `freshProtectedProcedure`     |
| Use case       | Normal protected access | Sensitive or destructive work |

The template's cookie cache can keep a revoked session usable for up to five minutes. Use the cached variants for ordinary protected pages, reads, and low-risk mutations where that tradeoff is acceptable. Use `freshAuthMiddleware` or `freshProtectedProcedure` for custom operations that must observe revocation immediately, including account deletion, email or password changes, role and permission changes, billing changes, secret rotation, and other privilege-sensitive mutations.

The fresh variants pass `disableCookieCache: true` to Better Auth and fetch the session from the database. They do not replace resource-level authorization, role checks, CSRF protection, or a recent-authentication challenge. Both middleware variants set status 401 and throw when unauthorized; both protected procedure variants throw `ORPCError("UNAUTHORIZED")`.

```ts
export const deleteProject = freshProtectedProcedure.handler(async ({ context }) => {
  // Still verify that context.session.user may delete this specific project.
});
```

## Registration Privacy

The default email-and-password sign-up flow automatically signs in a new user, so an existing email receives `422 USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL`. This reveals whether an address is registered. That may be acceptable for low-risk products, but agents must raise it when an application needs account-enumeration resistance.

For a uniform `200` sign-up response, configure either `emailAndPassword.requireEmailVerification: true` or `emailAndPassword.autoSignIn: false`. Email verification also requires a real `emailVerification.sendVerificationEmail` implementation and deliberate resend/sign-in behavior. Keep user-facing copy and timing uniform, and test both new and already-registered addresses. Plugins that add required user fields may also need `customSyntheticUser` so the synthetic duplicate response matches a real sign-up response.

## Client IP On Cloudflare Workers

IP-based rate limiting is only trustworthy when the runtime derives the address from connection metadata or from a header that the deployment platform overwrites. Never accept an arbitrary client-supplied forwarding header as the verified address.

- Read the client address only from Cloudflare's `CF-Connecting-IP` ingress header. Do not add a configurable `X-Forwarded-For` trust list to this runtime.
- Validate that the value is one IPv4 or IPv6 address. Missing or invalid values use the shared `unknown` bucket.
- If the Worker becomes reachable through a non-Cloudflare runtime or an internal subrequest path, re-evaluate how that path establishes a verified client address before relying on per-client limits.
- The server must overwrite the private `x-tsu-client-ip` header before calling Better Auth. Better Auth reads only that internal header; feature code must use the resolved Hono `clientIp` value instead of reparsing request headers.

## Database Configuration

- Enable Drizzle joins through `advanced.database.joins`; the previous `experimental.joins` option is obsolete.
- Better Auth 1.7.3 removed the generated account `issuer` field and its uniqueness constraint. Existing databases must apply the generated migration that drops both before running the upgraded auth packages.
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
