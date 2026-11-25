# Logging

Use `evlog` through `@tsu-stack/logger` only. Do not install or import `evlog` directly from `apps/*` or feature packages; the logger package is the facade and adapter boundary.

## Default Rule

Keep routine telemetry sparse. Use structured events for business outcomes and operational failures that warrant logs. Use evlog audit records for security-sensitive and accountability-relevant actions such as provisioning accounts, changing access, revoking credentials, exporting data, and deleting records.

- Temporary local debugging logs are allowed during investigation, but remove them before handoff.
- Existing logging infrastructure, middleware, ingestion, sampling, redaction, or documentation work requested by the user is in scope.

## Business-Critical Features

When a feature implements a critical domain process such as order fulfillment, payment settlement, account provisioning, or a data export, include server-side logging in the implementation by default. Plan the logs alongside the workflow so an operator can tell what completed, what failed, and which business record was affected.

1. At the code that owns the workflow, choose a stable operation name such as `order.fulfill` and attach the opaque order ID. Carry the request or workflow correlation ID across follow-up jobs and callbacks.
2. Use `logger.set(...)` for facts learned along the way. Record one retained outcome such as `order.fulfilled` or `order.fulfillment.failed` after the result is known. Include safe structured context such as the resulting state, the attempt count, or a stable failure reason. Let the owner of an unexpected exception record its details once.
3. For actions that need accountability, record `logger.audit(...)` with the server-verified actor, target, and outcome. Record authorization denials and wait until the state change commits before recording success.
4. During verification, check that a representative success and actionable failure or denial tell the story in the emitted logs. Use a focused smoke test for a security or validation boundary.

Treat one request or job as one wide event. Give independently committed work its own event when it needs a separate record. Routine reads, UI interactions, and retry steps can use existing request telemetry.

## When To Log

Log after the operation has reached an outcome, not before it starts. `INFO` should describe what happened, not what might happen. `DEBUG` may describe implementation steps while diagnosing or developing, but should not become routine product noise.

Prefer one wide event for a workflow or request over scattered narrow messages. Add context as the workflow progresses, then emit the terminal outcome once.

Good candidates:

- Business outcomes the product owner would recognize.
- Failed operations that need investigation.
- Expected but actionable degraded outcomes.
- Audit-worthy security or compliance events, including authorization denials for audited actions.
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

## Event Names

Keep messages stable and put data in fields.

| Field          | Meaning                                                                                         | Example                                                          |
| -------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `operation`    | Work the request or job is doing. Use `noun.verb` with a present-tense verb.                    | `database.migrate`, `user.create`                                |
| `event`        | A named occurrence or result. Use a past-tense verb or outcome as the final segment.            | `server.started`, `database.migration.completed`, `user.created` |
| `audit.action` | Stable intent for an audited action. Use `noun.verb` and record its outcome in `audit.outcome`. | `user.create`, `invoice.refund`, `api-key.revoke`                |

Use lowercase dot-separated names and hyphens for multiword segments. Keep names independent of route paths, handler names, IDs, labels, and localized copy. Treat them as stable identifiers once a query, alert, or UI depends on them. Request logs can rely on their HTTP fields when no named operation or event adds information. Use structured fields such as `profile.id`, `reason`, or `attempt` for details that vary by record.

Use `logger.set(fields)` for sampled context and `logger.outcome("noun.completed", fields)` for a named result that should survive request sampling. Ordinary `log.info()` is sampled out under the default server policy. Pass small plain objects and arrays. The logger bounds payload depth and size and serializes big integers as strings. A standalone job also owns a single emit for each logger instance.

```ts
const logger = createLogger({ operation: "database.migrate" });

try {
  await migrateDatabase();
} catch (error) {
  logger.error(error);
  logger.outcome("database.migration.failed");
  logger.emit();
  throw error;
}

logger.outcome("database.migration.completed");
logger.emit();
```

For framework request handlers, use the request-scoped logger provided by middleware:

- Hono: `c.get("log")`
- TanStack Start/oRPC context: pass and use the provided request logger

TanStack request middleware covers SSR, server routes, and server functions. Complete request log enrichment before handing back the response. Work that finishes during streaming or runs in the background needs its own logger and can carry the original request ID for correlation.

Request loggers expose `set`, `outcome`, `error`, and `audit`. The adapter owns `emit()`, HTTP fields, timing, and request IDs. Logger initialization owns `service` and the deployment version. Use `operation` and `event` to identify features. The ingestion boundary sets `source` for browser telemetry. Use a stable route template when you need to group parameterized paths.

## Audit Records

Use evlog’s reserved `audit` envelope. With one audit action and an active request logger, call `logger.audit(...)` and let middleware emit. For standalone work, auth lifecycle hooks, and independent actions in a batch, call `audit(...)` from `@tsu-stack/logger/server` once per action with a shared `correlationId` when appropriate. A request wide event has room for one audit record. Repeated `logger.audit(...)` calls merge into the same envelope.

```ts
const auditSubject = {
  action: "invoice.refund",
  actor: { type: "user", id: user.id },
  target: { type: "invoice", id: invoice.id }
} as const;

if (!canRefund(user, invoice)) {
  logger.audit.deny("insufficient_permissions", auditSubject);
  throw createError({ status: 403, message: "Forbidden" });
}

try {
  await refundInvoice(invoice.id);
} catch (error) {
  logger.audit({ ...auditSubject, outcome: "failure", reason: "refund_failed" });
  throw error;
}

logger.audit({ ...auditSubject, outcome: "success" });
```

- Record success after the change commits. Use `failure` when execution fails and `denied` when authorization rejects the action. An audit record can describe an attempt even when no change occurred.
- Build the actor from server-owned identity. Use stable IDs and the appropriate evlog actor type (`user`, `system`, `api`, or `agent`). Capture `target.type` and `target.id` when known and safe to persist. For tenant-scoped actions, pass the verified tenant ID as `target.tenantId`.
- Use stable reason codes and allowlisted change fields. Keep emails, credentials, raw exceptions, session data, and user-provided prose out of the audit payload. Keep diagnostic error details on the operational event.
- evlog assigns `audit.version` for the record format and `audit.idempotencyKey` for drain retry deduplication. It retains audit records past tail sampling. Use the request's `requestId` for request correlation and `audit.correlationId` for a standalone record or group of actions. Use `audit.causationId` when one record directly caused another. These IDs carry no authorization. Include IP addresses or user agents only when a deployment has a documented need and a trusted source.
- Share a feature-owned action constant when an audit producer and a UI renderer or alert use the same identifier.
- The starter records `user.create` when Better Auth creates the account. The provisioning service is the actor and the persisted user is the target. A synthetic duplicate signup does not produce a creation record.

### Frontend Consumption

Query trusted server-side audit records through an authorized, scope-filtered, paginated endpoint. Project each wide event to a public row with an opaque row ID, `timestamp`, `audit.version`, `audit.action`, `audit.outcome`, and the actor, target, reason, and change fields the viewer may see. Browser telemetry stays under `client` and ingestion strips its `audit` field.

Use the full action string as the lookup key for localized messages, icons, and specialized components. Use `outcome` for wording and status badges, and `target.type` for resource links. For example, a `user.create` renderer can show “Account created” for a successful outcome. Give unknown actions or newer versions a generic renderer. Keep timestamps and permission decisions on the data contract so the UI does not have to recover them from prose or parse segments of an action key.

### Persistence

The default server output is evlog’s console stream. A deployment that needs searchable history configures a drain for every process that emits audits. Use a scoped audit dataset or an append-only store, with explicit retention and access controls. Use evlog’s `auditOnly` and `signed` wrappers when tamper evidence is required, and verify flush and retry behavior for the deployment runtime. For changes that require atomic persistence with their audit record, use the same transaction or a transactional outbox. Before using evlog’s generated idempotency key as a unique store key, account for independent actions with identical actor, target, action, and outcome in the same second in evlog 2.36.

[evlog audit schema](https://www.evlog.dev/use-cases/audit/schema) · [Recording audit events](https://www.evlog.dev/use-cases/audit/recording) · [Drains and integrity](https://www.evlog.dev/use-cases/audit/pipeline)

## Post-Emit Warnings

Once `logger.emit()` has been called on an evlog wide-event or request logger, treat that logger instance as sealed. Any later `set()`, `emit()`, or `error()` call on that same instance is a bug and can trigger `[evlog] log.X() called after the wide event was emitted`.

Common causes:

- Wrapping a framework handler with a second request logger when request middleware already creates and emits one. In TanStack Start, rely on `tanstackStartRequestLoggerMiddleware` instead of adding another outer request logger around the same request.
- Emitting inside a route or handler and then letting middleware emit again on that same logger.
- Emitting during a retry and then reusing the logger for the terminal outcome.

`logger.error(...)` does not auto-emit. Add the error context you need, then make sure `emit()` still happens exactly once for that logger lifetime.

## Error Handling

Let the boundary that observes the failure record it once. The Hono adapter records thrown errors from `c.error`. `app.onError` translates them into safe responses and can log a fallback for an unexpected error outside the adapter. The TanStack Start request adapter records thrown request errors. oRPC keeps expected 4xx codes as structured context. Its hooks record exceptions handled internally, and Hono handles errors rethrown by OpenAPI. Better Auth forwards provider warnings and errors as fixed events with no raw provider arguments. Keep unexpected diagnostic details in the server log and return safe fields to clients.

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

## Identity

Request logs use request IDs for correlation and do not resolve auth sessions for enrichment by default. When a workflow already owns an authenticated user ID and has a concrete operational need for it, attach only that allowlisted ID; do not attach full user or session objects.

Client identity sync is separate from server request identity. Browser logs should only mirror the minimal current identity needed for correlation, usually `user.id`.

When using `setIdentity(user.id)` on the client:

- Call `clearIdentity()` when the user logs out.
- Call `clearIdentity()` when the session expires or the auth query resolves to no user.
- Call `clearIdentity()` in provider cleanup before setting a different identity.
- Do not keep the previous user identity while showing anonymous, signed-out, or expired-session UI.

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

- Use the shared `REQUEST_LOG_SAMPLING` policy for web and API request loggers so services retain the same failures and slow requests.
- Keep errors and slow requests.
- Sample or drop routine successful requests.
- Use `logger.outcome(...)` to retain deliberately named business and lifecycle results past request sampling.
- Include `requestId`, method, route/path, status, duration, and approved coarse context. Accept only validated request IDs, generate one otherwise, and echo the effective `X-Request-Id` response header.
- Browser API requests create a request ID when one is not already present. Treat it as correlation metadata, never as identity or authorization. Full OTEL tracing remains an optional deployment feature.
- Use `BETTER_AUTH_TRUSTED_IP_HEADER` only if a trusted edge overwrites the header and requests cannot bypass that edge. Omit IP when it is not operationally needed. [Auth patterns](./auth.md)
- Do not include raw cookies, headers, bodies, or arbitrary query params.

## Client Logging

Client logs should be rare. Prefer logging client errors and failed important user workflows. The server records authoritative audit events.

Do not log in React render paths. If a client log is necessary, emit it from an effect or event handler and dedupe where needed.

When browser transport is enabled, remember that client logs are sent to the server ingestion endpoint. Treat them as production logs, not just DevTools messages.

Send a stable event name, a coarse error type, and a status if it is useful. Browser error messages and stacks stay in the browser. The browser transport accepts at most 25 events per batch and 2 KiB per serialized event. Ingested events use `source: "client"` and carry the reported severity as `client.level`. Filter on server provenance for operational paging.

## Operational Limits And Health Checks

Keep the server boundaries and their intent aligned:

- General Hono request bodies are capped at 1 MiB. Routes requiring larger uploads must use a deliberately designed streaming or upload path instead of raising the global limit casually.
- Browser log ingestion accepts at most 64 KiB and 50 events per request, with 60 requests per minute per resolved client IP. Malformed JSON returns `400`, a body over the byte limit returns `413`, and schema-invalid or over-count batches return `422`. Rejected batches emit no events.
- Database readiness checks allow 30 requests per minute per resolved client IP. Liveness checks are intentionally not rate limited.
- The in-memory operational limits are per Node process. Multi-replica deployments that need a global abuse boundary must also enforce one at the proxy/edge or use an atomic shared limiter.
- A missing client address uses a shared `unknown` bucket. Fix production IP resolution rather than increasing limits to compensate.

Health checks and log ingestion are excluded from request logging. Preserve that exclusion: logging health probes creates noise, and request-logging the ingestion endpoint can create recursive client/server log traffic.

Docker and Coolify check the web app's `/_api/health/live` every 10 seconds. Liveness is unlogged, outside the readiness limiter, and free of database or downstream checks. The Hono readiness route under the API base path may check dependencies and allows 30 requests per minute per resolved client IP. Calculate the combined rate when several external monitors share an address or use a faster cadence.

## Bootstrap Console

Bootstrap/config packages such as `@tsu-stack/env` may use small `console.debug` statements because they are loaded before logger initialization and by Vite config. Do not route env bootstrap through `@tsu-stack/logger`.
