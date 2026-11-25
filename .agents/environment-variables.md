# Environment variables

Start local development from [the env example](../packages/env/.env.example) in `packages/env/.env`. The env package validates settings with Zod and `@t3-oss/env-core`.

- `ENV_SERVER` is server-only for Hono and auth inside the Worker. `ENV_WEB_SERVER` is web server-only. `ENV_WEB_ISOMORPHIC` is shared with the browser. Expose only non-sensitive values through the client’s `VITE_` surface. Use `z.stringbool()` for string booleans.
- Change the owning schema, env example, and [environment docs](../.github/README.md) together. Keep documented variables aligned with schema consumers. Required secrets such as `DATABASE_URL` and `BETTER_AUTH_SECRET` stay server-side.
- Declare Worker runtime values and required secrets in [Wrangler](../apps/web/wrangler.jsonc). Configure credentials as Worker secrets. Use Cloudflare build secrets only for build steps that need credentials. Forward public build inputs through the owning Vite task.
- Check bootstrap diagnostics when env loading fails. Use [Auth](auth.md) for Cloudflare ingress and [Database](database.md) for migration target checks.
