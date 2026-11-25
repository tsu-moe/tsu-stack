# Zustand for client-owned state

Use Zustand when several components share mutable client-owned state such as drafts, preferences, or UI coordination. Use local state for one owner and props or injection for simple configuration. Existing Context providers supply stable integration dependencies. Get explicit user direction before adding React Context. Keep server data in [TanStack Query](data-flow.md).

- Declare `zustand` in any package that uses it. Put `*.store.ts` in the narrowest owning slice’s `stores/`, React wrappers in `hooks/use-*.hook.ts`, and component-family state near reusable UI. Keep business state out of generic `shared/`.
- Use one typed store per concern with state before actions. Put transitions in actions, using object `set` for replacements and functional `set` for prior-state calculations. Copy collections. Prefer clear action names and an object for multiple arguments.
- Use per-field selectors and `useShallow` for composite selector results. Derive cheap values in the wrapper. Keep client-owned async I/O in a colocated service. Coordinate Router, auth, effects, and mutations in hooks.
- Compose global local-data slices only for explicit shared-store requirements or coordinated reads, actions, export, reset, or persistence. Keep typed `*.slice.ts` creators with domain owners and the composition shell in `shared/stores/`.
- Persist durable state only. Give it a stable key and use `version`, `migrate`, and `partialize` as needed. Keep transient UI, request data, auth secrets, and the server cache out of storage.
- Use deterministic SSR defaults and a hydration-aware fallback. Initialize from safe serialized data, guard browser APIs, and let middleware hydrate persisted state. Keep request-specific data out of module stores. Call Zustand hooks only from React. Use [Web routes](data-flow.md#reads) for blocking query freshness, and invalidate Router from React when a store change affects route decisions.

Use `type` declarations and the owning slice’s import aliases. See [TypeScript](typescript.md) and [UI](ui.md).
