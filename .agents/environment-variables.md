# Environment variables

Start local development from [the env example](../packages/env/.env.example) in `packages/env/.env`. The env package validates settings with Zod and `@t3-oss/env-core`.

- `ENV_SERVER` is API server-only. `ENV_WEB_SERVER` is web server-only. `ENV_WEB_ISOMORPHIC` is shared with the browser. Expose only non-sensitive values through the client’s `VITE_` surface. Use `z.stringbool()` for string booleans.
- Change the owning schema, env example, and [environment docs](../.github/README.md) together. Keep documented variables aligned with schema consumers. Required secrets such as `DATABASE_URL` and `BETTER_AUTH_SECRET` stay server-side.
- Propagate settings through the relevant Compose services and the merged web Dockerfile. Pass only non-sensitive build inputs via build args and Vite injection. Supply credentials at runtime. Use BuildKit secret mounts for steps that actually need sensitive inputs. The Docker build uses the example env for validation and prerendering.
- Check bootstrap diagnostics when env loading fails. Use [Auth](auth.md) for trusted proxies and [Database](database.md) for migration target checks.
