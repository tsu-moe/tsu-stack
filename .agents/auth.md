# Auth

TanStack Start forwards the API route to Hono, where Better Auth owns `/auth/*`. Use `authClient` for browser operations. Create server auth with `createAuth()` per request and keep the CLI-only auth instance out of runtime code. Reuse Better Auth’s existing account operations when they fit, such as `updateUser({ name })` for a signed-in user’s display name. Keep identity server-owned and use the shared auth Query cache for UI consistency.

## Sessions and guards

- The Start `$getUser` function reads request headers and forwards refresh cookies. Reuse `getAuthUserQueryOptions()` in loaders and React. It is fresh for five minutes, uses ten-minute GC in browsers and infinite GC on the server, and refetches on focus.
- Root `beforeLoad` warms with a handled background query. Protected and guest layouts intentionally do a static read then revalidate normally. Protected routes redirect to sign-in with a validated return URL and recheck on session expiry. Guest routes validate the redirect against the route tree.
- Use `authMiddleware` or `protectedProcedure` for normal protected work that tolerates the five-minute cookie cache. Use `freshAuthMiddleware` or `freshProtectedProcedure` for custom sensitive or destructive work that must observe revocation immediately, such as credentials, billing, roles, or account deletion. Fresh lookups bypass the cookie cache. Keep resource authorization, CSRF protection, and recent-auth requirements at the server boundary.
- Use Better Auth cookie defaults for reusable projects. Cross-domain auth needs deliberate cookie, domain, origin, and CORS settings.

## Registration and network trust

- Default auto-sign-in reveals registered emails via duplicate-signup errors. For enumeration resistance, enable email verification with a real sender and deliberate resend/sign-in behavior, or set `autoSignIn: false`. Verify uniform new/duplicate behavior and synthetic required fields where plugins need them.
- Use Cloudflare’s `CF-Connecting-IP` from trusted Worker ingress and accept one valid IPv4 or IPv6 address. Missing or invalid input uses the shared `unknown` bucket. Recheck trust for non-Cloudflare ingress or internal subrequests. Hono overwrites `x-tsu-client-ip` for Better Auth. Feature code uses Hono’s resolved IP. In-memory limits are per isolate.
- Keep `advanced.database.joins` configured for Drizzle. For custom user/session fields, update `additionalFields`, follow [schema regeneration and migration](database.md), and use `inferAdditionalFields` with the server auth type when the browser consumes those fields. Apply the tracked issuer-column removal migration when upgrading a database that still has that Better Auth field.

See [Web routes](data-flow.md) and [Logging](logging.md#audit-records).
