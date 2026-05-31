# Logging

Use `evlog` through `@tsu-stack/logger` only. Do not install or import `evlog` directly from `apps/*` or feature packages; the logger package is the facade and adapter boundary.

If logging is not part of the task, stop here and do not add new durable logs.

## Default Rule

Do not add or retain application logs during normal implementation work unless the user explicitly asks for logging or the flow is clearly audit, security, or otherwise high-risk.

- Temporary local debugging logs are allowed during investigation, but remove them before handoff.
- Existing logging infrastructure, middleware, ingestion, sampling, redaction, or documentation work requested by the user is in scope.

## When To Log

Log after the operation has reached an outcome, not before it starts. `INFO` should describe what happened, not what might happen. `DEBUG` may describe implementation steps while diagnosing or developing, but should not become routine product noise.

Prefer one wide event for a workflow or request over scattered narrow messages. Add context as the workflow progresses, then emit the terminal outcome once.

Good candidates:

- Business outcomes the product owner would recognize.
- Failed operations that need investigation.
- Expected but actionable degraded outcomes.
- Audit-worthy security or compliance events, with explicit approval.
- Lifecycle events that are rare and useful, such as server startup or migration completion.

Poor candidates:

- Every successful request, query, render, hover, navigation, or health check.
- Logs whose only purpose is proving code reached a line.
- Warnings no one needs to act on.
- Duplicates of errors already captured by request middleware.

## Levels

- `INFO`: a completed business or lifecycle outcome. Keep this sparse.
- `DEBUG`: implementation detail for active investigation. Do not keep it by default.
- `WARN`: an expected degraded outcome that needs action or attention.
- `ERROR`: an operation failed.

A `WARN` or `ERROR` should be a call to action. If nobody should react, do not use those levels.

## Structure

Keep messages stable and put data in fields.

```ts
// Avoid
log.info("server", `Server running on ${url}`);

// Prefer
log.info({ event: "server_started", url });
```

For request and workflow logging, prefer evlog wide-event APIs.

```ts
const logger = createLogger({ operation: "server__database_migration" });

try {
  await migrateDatabase();
  logger.emit({ event: "database_migration_completed" });
} catch (error) {
  logger.error(error instanceof Error ? error : String(error), {
    event: "database_migration_failed"
  });
  logger.emit({ _forceKeep: true });
}
```

For framework request handlers, use the request-scoped logger provided by middleware:

- Hono: `c.get("log")`
- TanStack Start/oRPC context: pass and use the provided request logger

Do not create a new standalone logger inside a request if a request logger is already available.

## Post-Emit Warnings

Once `logger.emit()` has been called on an evlog wide-event or request logger, treat that logger instance as sealed. Any later `set()`, `emit()`, or `error()` call on that same instance is a bug and can trigger `[evlog] log.X() called after the wide event was emitted`.

Common causes:

- Wrapping a framework handler with a second request logger when request middleware already creates and emits one. In TanStack Start, rely on `tanstackStartRequestLoggerMiddleware` instead of adding another outer request logger around the same request.
- Emitting inside a route or handler and then letting middleware emit again on that same logger.
- Calling `emit()` in both a success path and a catch or finalizer for the same logger instance.

`logger.error(...)` does not auto-emit. Add the error context you need, then make sure `emit()` still happens exactly once for that logger lifetime.

## Error Handling

Prefer global error handling over per-catch logging in request code. In Hono, register one `app.onError` handler, log the thrown value with the request-scoped logger, parse it, then return a structured response.

```ts
import { parseError } from "@tsu-stack/logger/server";
import type { ContentfulStatusCode } from "hono/utils/http-status";

app.onError((error, c) => {
  c.get("log").error(error);

  const parsed = parseError(error);

  return c.json(
    {
      message: parsed.message,
      ...(parsed.code ? { code: parsed.code } : {}),
      ...(parsed.why ? { why: parsed.why } : {}),
      ...(parsed.fix ? { fix: parsed.fix } : {}),
      ...(parsed.link ? { link: parsed.link } : {})
    },
    parsed.status as ContentfulStatusCode
  );
});
```

Use structured errors for intentional failures that should produce helpful responses:

```ts
import { createError } from "@tsu-stack/logger/server";

throw createError({
  message: "Payment failed",
  status: 402,
  why: "Card declined by issuer",
  fix: "Try a different payment method"
});
```

Do not log an error and then rethrow it unless the downstream global handler will not see it. Add useful context with `log.set(...)`, then let the global handler record the failure once. If a framework integration handles errors internally, prefer its request-scoped logger/context; use the global `log.error(...)` only when no request logger exists.

## Identity And Better Auth

Use Better Auth identification through evlog's Better Auth integration when request identity is needed. Keep that integration behind `@tsu-stack/logger`; do not import `evlog/better-auth` directly from app or feature code unless the logger package is being updated.

Server request identity should be automatic and request-scoped:

- Resolve identity in middleware after the request logger exists and before route handlers run.
- Hono: identify `c.get("log")` with `c.req.raw.headers` and `c.req.path`.
- TanStack Start/oRPC: identify the request logger passed through context, using request headers.
- Exclude auth endpoints, log ingestion endpoints, health checks, and other noisy/system routes unless explicitly needed.
- Do not manually `log.set({ user })` or attach full Better Auth session objects in feature handlers.

Rely on the Better Auth integration's safe field extraction. It should identify users with stable, allowlisted fields such as user/session IDs and approved profile/session metadata. Do not log passwords, tokens, raw cookies, authorization headers, or full user/session records.

Client identity sync is separate from server request identity. Browser logs should only mirror the minimal current identity needed for correlation, usually `user.id`.

When using `setIdentity` on the client:

- Call `clearIdentity()` when the user logs out.
- Call `clearIdentity()` when the session expires or the auth query resolves to no user.
- Call `clearIdentity()` in provider cleanup before setting a different identity.
- Do not keep the previous user identity while showing anonymous, signed-out, or expired-session UI.
- Prefer clearing first, then setting `{ user: { id: "anonymous" } }` only if anonymous correlation is useful.

## Sensitive Data

Never log secrets, passwords, session tokens, authorization headers, raw cookies, raw request/response bodies, or full user/session objects.

Use evlog's centralized `redact` configuration in `@tsu-stack/logger/server`; do not create one-off redaction helpers at individual callsites. If a new sensitive field family appears, add it to the shared logger redaction config instead of masking it manually in feature code.

Evlog redaction is a guardrail, not permission to log raw blobs. The server logger enables built-in PII masking and configured path redaction centrally, but agents should still choose safe fields up front.

Be careful with:

- Query strings, because they can contain tokens or emails.
- URLs, because they can include query strings.
- IP addresses and user agents, because they can be personal data.
- Browser error stacks, because they can include paths or bundled source details.

Prefer IDs over full records. Prefer allowlisted fields, then rely on centralized evlog redaction as the backstop.

## Request Logging

Request logging should be sampled and outcome-oriented.

- Keep errors and slow requests.
- Sample or drop routine successful requests.
- Include `requestId`, method, route/path, status, duration, and approved coarse context.
- Do not include raw cookies, headers, bodies, or arbitrary query params.

## Client Logging

Client logs should be rare. Prefer logging client errors, failed important user workflows, and explicitly approved audit/security events.

Do not log in React render paths. If a client log is necessary, emit it from an effect or event handler and dedupe where needed.

When browser transport is enabled, remember that client logs are sent to the server ingestion endpoint. Treat them as production logs, not just DevTools messages.

## Bootstrap Console

Bootstrap/config packages such as `@tsu-stack/env` may use small `console.debug` statements because they are loaded before logger initialization and by Vite config. Do not route env bootstrap through `@tsu-stack/logger`.
