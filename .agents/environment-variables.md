# Environment variables and bindings

Start local development from [the env example](../packages/env/.env.example) in `packages/env/.env`. The env package validates settings with Zod and `@t3-oss/env-core`.

- `ENV_SERVER` is server-only for Hono and auth inside the Worker. `ENV_WEB_SERVER` is web server-only. `ENV_WEB_ISOMORPHIC` is shared with the browser. Expose only non-sensitive values through the client’s `VITE_` surface. Use `z.stringbool()` for string booleans.
- Change the owning schema, env example, and [environment docs](../.github/README.md) together. Keep documented variables aligned with schema consumers. Keep `BETTER_AUTH_SECRET` server-side.
- Declare Worker runtime values and required secrets in [Wrangler](../apps/web/wrangler.jsonc). Configure credentials as Worker secrets. Use Cloudflare build secrets only for build steps that need credentials. Forward public build inputs through the owning Vite task.
- Check bootstrap diagnostics when env loading fails. Use [Auth](auth.md) for Cloudflare ingress and [Database](database.md) for local and remote D1 migration targets.

`DB` is a D1 binding declared in Wrangler and read from `cloudflare:workers`. Keep it out of string env schemas and `process.env`. Regenerate `apps/web/worker-configuration.d.ts` with `vp run --filter @tsu-stack/web cf:types` after binding changes. Use `createDb()` at the call site so it uses the active Worker binding.
