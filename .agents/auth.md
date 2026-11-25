# Auth

Better Auth owns `/auth/*` on the Hono server and the client exposes `authClient`. Reuse Better Auth’s existing account operations when they fit, such as `updateUser({ name })` for a signed-in user’s display name. Keep identity server-owned and use the shared auth Query cache for UI consistency.

## Sessions and guards

- The Start `$getUser` function reads request headers and forwards refresh cookies. Reuse `getAuthUserQueryOptions()` in loaders and React. It is fresh for five minutes, uses ten-minute GC in browsers and infinite GC on the server, and refetches on focus.
- Root `beforeLoad` warms with a handled background query. Protected and guest layouts intentionally do a static read then revalidate normally. Protected routes redirect to sign-in with a validated return URL and recheck on session expiry. Guest routes validate the redirect against the route tree.
- Use `authMiddleware` or `protectedProcedure` for normal protected work that tolerates the five-minute cookie cache. Use `freshAuthMiddleware` or `freshProtectedProcedure` for custom sensitive or destructive work that must observe revocation immediately, such as credentials, billing, roles, or account deletion. Fresh lookups bypass the cookie cache. Keep resource authorization, CSRF protection, and recent-auth requirements at the server boundary.
- Use Better Auth cookie defaults for reusable projects. Cross-domain auth needs deliberate cookie, domain, origin, and CORS settings.

## Registration and network trust

- Default auto-sign-in reveals registered emails via duplicate-signup errors. For enumeration resistance, enable email verification with a real sender and deliberate resend/sign-in behavior, or set `autoSignIn: false`. Verify uniform new/duplicate behavior and synthetic required fields where plugins need them.
- Resolve rate-limit IP from the socket or a verified platform source. Direct Node connections leave `BETTER_AUTH_TRUSTED_PROXIES` empty. Behind forwarding proxies, trust only their exact IPs or narrow CIDRs and resolve right to left from the peer. Hono overwrites `x-tsu-client-ip` for Better Auth. Feature code uses Hono’s resolved IP. In-memory limits are per instance.
- Keep `advanced.database.joins` configured for Drizzle. For custom user/session fields, update `additionalFields`, follow [schema regeneration and migration](database.md), and preserve `inferAdditionalFields<typeof auth>()` in the client. Apply the tracked issuer-column removal migration when upgrading a database that still has that Better Auth field.

See [Web routes](data-flow.md) and [Logging](logging.md#audit-records).
