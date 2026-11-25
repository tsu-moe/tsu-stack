# Logging

Use evlog through `@tsu-stack/logger`. Keep routine telemetry sparse. Log meaningful business outcomes, actionable operational failures, and security or accountability events. Remove temporary debugging logs before handoff.

## Business-critical features

Instrument critical workflows in the same change. Choose a stable operation, attach an opaque business record ID, and carry the request or workflow correlation ID across jobs and callbacks. Record a retained terminal outcome after the result is known. Include safe state, attempt, or reason fields. Verify a representative success and actionable failure or denial. See [Testing](testing.md) for focused boundary coverage.

## Wide events

- Use `logger.set(fields)` for sampled context, `logger.outcome(event, fields)` for results that should survive request sampling, and `logger.error(error)` at the boundary that owns the failure. Routine reads and retry steps use existing telemetry.
- Name an operation `noun.verb` such as `order.fulfill`, and an event for the outcome such as `order.fulfilled` or `order.fulfillment.failed`. Use lowercase dot-separated names and hyphens within multiword segments. Put changing IDs, labels, and reasons in fields.
- Use INFO for completed outcomes, WARN for actionable degradation, ERROR for failures, and DEBUG for investigation. Put only small plain structured fields on the event.
- Hono uses `c.get("log")`; Start and oRPC pass a request logger. Middleware owns the single emit and HTTP fields. Complete enrichment before returning the response. Standalone jobs, independent actions, and work after response or during streaming use their own logger with correlation. `error()` does not emit. Treat emitted instances as sealed.
- Enrich context and let the observing boundary log an unexpected failure once. oRPC attaches expected 4xx codes as structured context. Hono and Start adapters see thrown failures; interceptor or global fallback logging is for exceptions the normal boundary cannot see. Use `createError` from `@tsu-stack/logger/server` for safe structured intentional failures.

## Audit records

Use the reserved `audit` envelope for provisioning, access changes, credential revocation, exports, deletion, and other accountable actions. A request logger holds one audit record. Use its `logger.audit(...)` for a single action and standalone `audit(...)` from `@tsu-stack/logger/server` for hooks, background work, or each independent batch action.

- Use a stable `audit.action` in `noun.verb` form and `audit.outcome` of `success`, `failure`, or `denied`. Record success after commit and record authorization denials. Build the actor from verified server identity and use a stable actor type and ID. Include known safe target type/ID, verified tenant ID where applicable, stable reason, and allowlisted changes.
- Correlate request records with `requestId` and standalone/batch records with `audit.correlationId`. Use `audit.causationId` for a direct causal link. evlog adds version and retry dedupe fields and retains audits past sampling. Check the installed evlog version’s dedupe semantics before using the generated key as a store uniqueness constraint.
- Keep credentials, email, raw errors, personal prose, and session data out of audits. Add IP or user agent only when a deployment documents the need and verifies the source. The starter emits `user.create` for persisted account provisioning, including the provisioning service as actor, without recording synthetic duplicates.
- Expose allowed fields through an authorized, scope-filtered, paginated server projection with an opaque row ID, timestamp, version, action, and outcome. Share action constants when producers and consumers need them. Use the full action for localized UI lookup, with a generic fallback for unknown actions or versions.
- Console output is the default. Deployments needing searchable history configure a drain on each emitter, authorized access, retention, and verified flush/retry behavior. Use an append-only or scoped dataset, and consider evlog’s `auditOnly` and `signed` wrappers for integrity. Use a transaction or outbox when the audit must commit atomically with the change. See the [evlog audit schema](https://www.evlog.dev/use-cases/audit/schema) and [pipeline](https://www.evlog.dev/use-cases/audit/pipeline).

## Request and browser telemetry

- Retain errors, slow requests, and deliberate outcomes via shared `REQUEST_LOG_SAMPLING`. Include correlation, method, route, status, and duration. Validate inbound request IDs and echo the effective `X-Request-Id`. IDs correlate events. Authorization comes from verified identity. Avoid speculative session lookups for log enrichment.
- Never log credentials, tokens, cookies, auth headers, bodies, raw URLs or query strings with sensitive data, or whole user/session objects. Allowlist minimal fields and opaque IDs. Extend the shared redaction config for new sensitive field families. Log client IP only when necessary and resolved through the [trusted ingress](auth.md#registration-and-network-trust).
- Log browser failures sparingly from effects or event handlers. Send coarse type/status and stable event names. Keep raw browser messages and stacks local. Clear the minimum client identity on logout, expiry, no-user result, and provider cleanup. Browser ingestion strips audit data and uses `source: "client"` with nested client severity. Page on trusted server provenance.
- Docker and Coolify probe web `/_api/health/live` every ten seconds. Keep it cheap and free of downstream checks. The Hono readiness route under the API base path may check dependencies and is rate-limited. Exclude health and ingestion from request logging to avoid noise and recursion. Keep [limits and probe cadence](../apps/server/src/index.ts) aligned. In-memory limits are per Node process. Use an edge or shared limiter when replicas need a global limit. Fix address resolution when requests collapse into the `unknown` bucket.
- Bootstrap modules may use small `console.debug` diagnostics before the logger is initialized.
