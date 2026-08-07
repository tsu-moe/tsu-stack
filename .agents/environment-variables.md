# Environment Variables And Bindings

## Single Source of Truth

All env vars live in `packages/env/.env` (copy from `.env.example`). Validated by Zod at import time via `@t3-oss/env-core`.

## Three Scoped Objects

| Object               | Scope                        |
| -------------------- | ---------------------------- |
| `ENV_SERVER`         | Server-only (`apps/server`)  |
| `ENV_WEB_ISOMORPHIC` | Client + server (`apps/web`) |
| `ENV_WEB_SERVER`     | Web server-only              |

## Client Exposure Rule

Only vars prefixed with `VITE_` are available on the client (`import.meta.env`). Server-only values such as `BETTER_AUTH_SECRET` must never be exposed to the client.

## Cloudflare Bindings

`DB` is a D1 binding, not a string environment variable. It is declared in `apps/web/wrangler.jsonc`, represented in `apps/web/worker-configuration.d.ts`, and read through `cloudflare:workers` at runtime. Do not add it to `packages/env`, `.env`, or `process.env`.

Worker bindings are request/runtime resources. Do not cache a D1 client or binding-derived object at module scope. Use `createDb()` at the call site so the current Worker binding is used.

## When Adding/Updating Env Vars

Update the applicable locations:

1. `packages/env/src/` — add Zod validation to the appropriate scoped object
2. `packages/env/.env.example` — add a safe placeholder for local development
3. `apps/web/wrangler.jsonc` — add runtime text variables, secrets safeguards, or resource bindings as appropriate
4. `apps/web/worker-configuration.d.ts` — regenerate with `vp run --filter @tsu-stack/web cf:types` after binding changes
5. `.github/README.md` — document scope, setup, and deployment requirements
6. `apps/web/vite.config.ts` — include build-time inputs when the build task consumes them

Missing any of these causes build or runtime failures with no obvious error message.

Env docs and templates must mirror the validated schema in `packages/env/src/`. Do not invent, retain, or document env vars that are not actually read there. If a setting is code-owned, document it as code-owned instead of adding a new env knob.

## Gotchas

- `z.stringbool()` is used for boolean env vars (parses "true"/"false" strings)
- Dev defaults exist for most `VITE_*` vars; `BETTER_AUTH_SECRET` is always required
- D1 replaces `DATABASE_URL`; do not reintroduce a connection string for the `DB` binding
- Each env file logs loading with `console.debug` — check terminal output for validation errors
