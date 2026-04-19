# Environment Variables

## Single Source of Truth

All env vars live in `packages/env/.env` (copy from `.env.example`). Validated by Zod at import time via `@t3-oss/env-core`.

## Three Scoped Objects

| Object               | Scope                        | Access                                                       |
| -------------------- | ---------------------------- | ------------------------------------------------------------ |
| `ENV_SERVER`         | Server-only (`apps/server`)  | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NODE_ENV`, etc.       |
| `ENV_WEB_ISOMORPHIC` | Client + server (`apps/web`) | `VITE_SERVER_URL`, `VITE_WEB_URL`, `VITE_IMGPROXY_URL`, etc. |
| `ENV_WEB_SERVER`     | Web server-only              | `NODE_ENV`, `SOURCE_COMMIT`, `IS_BUILD`, etc.                |

## Client Exposure Rule

Only vars prefixed with `VITE_` are available on the client (`import.meta.env`). Server-only vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`) must never be exposed to the client.

## When Adding/Updating Env Vars

Update in **five places**:

1. `packages/env/src/` — add Zod validation to the appropriate scoped object
2. `docker-compose.yaml` — add to both `build.args` and `environment` for affected services
3. `Dockerfile` — add matching `ARG` + `ENV` declarations in the relevant Dockerfile(s)
4. `.env.example` — add with placeholder value for local development
5. `.github/README.md` — update this file with the new var, its scope, and usage notes

Missing any of these causes build or runtime failures with no obvious error message.

## Gotchas

- `z.stringbool()` is used for boolean env vars (parses "true"/"false" strings)
- Dev defaults exist for most `VITE_*` vars; `DATABASE_URL` and `BETTER_AUTH_SECRET` are always required
- Each env file logs loading with `console.debug` — check terminal output for validation errors
