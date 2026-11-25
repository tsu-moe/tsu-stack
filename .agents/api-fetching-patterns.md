# Slice-local API fetching

Keep TanStack Query wiring for oRPC inside the owning web slice’s `api/`. Use `get-profile.query.ts` → `useGetProfileQuery` and `update-profile.mutation.ts` → `useUpdateProfileMutation`. Keep one operation per file when practical. Export hooks to UI and export factories through the slice barrel when a route uses them.

- A query module normally exposes key helpers, an options factory, and a hook. Use the typed oRPC client’s `.key({ input })` and `.queryOptions({ input })`. Infer results from the producer when an explicit result type helps.
- A mutation module owns the options, hook, and any cache updates or invalidation. Use `.mutationOptions()` for oRPC and the existing provider client for provider-owned operations. Update only affected caches using shared key helpers. Keep raw provider and query wiring out of components.
- For route warming, freshness, cancellation, and mutation reconciliation, follow [Web routes and data flow](data-flow.md). Import shared domain inputs and defaults from [Core](core.md).
- For oRPC mutation errors, follow [oRPC](orpc.md). Test wrappers only when they add behavior such as key construction, cache updates, or error mapping. See [oRPC testing](orpc-testing.md).
