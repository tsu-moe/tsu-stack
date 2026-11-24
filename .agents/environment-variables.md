# Environment Variables

## Single Source of Truth

All env vars live in `packages/env/.env` (copy from `.env.example`). Validated by Zod at import time via `@t3-oss/env-core`.

## Three Scoped Objects

| Object               | Scope                        |
| -------------------- | ---------------------------- |
| `ENV_SERVER`         | Server-only (`apps/server`)  |
| `ENV_WEB_ISOMORPHIC` | Client + server (`apps/web`) |
| `ENV_WEB_SERVER`     | Web server-only              |

## Client Exposure Rule

Only vars prefixed with `VITE_` are available on the client (`import.meta.env`). Server-only vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`) must never be exposed to the client.

## When Adding/Updating Env Vars

Update the applicable locations:

1. `packages/env/src/` — add Zod validation to the appropriate scoped object
2. `packages/env/.env.example` — add a safe placeholder for local development
3. `apps/web/wrangler.jsonc` — declare runtime variables and required secrets as appropriate
4. `.github/README.md` — document scope, setup, and deployment requirements
5. `apps/web/vite.config.ts` — forward inputs consumed by the build task

Configure production credentials as Worker secrets. Use Cloudflare build secrets for credentials that the build consumes.

Env docs and templates must mirror the validated schema in `packages/env/src/`. Do not invent, retain, or document env vars that are not actually read there. If a setting is code-owned, document it as code-owned instead of adding a new env knob.

## Gotchas

- `z.stringbool()` is used for boolean env vars (parses "true"/"false" strings)
- Dev defaults exist for most `VITE_*` vars; `DATABASE_URL` and `BETTER_AUTH_SECRET` are always required
- Each env file logs loading with `console.debug` — check terminal output for validation errors
