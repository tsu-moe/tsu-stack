# TypeScript

Infer types from the schema, API, or producer that owns them. Correct the source type when it is wrong. Keep assertions next to the evidence for the fact TypeScript cannot express. Use `satisfies` to check configuration without widening inference.

- Parse untrusted data at the nearest I/O boundary with the owner’s validator or Zod. Use `parse` or `safeParse` directly unless decoding, normalization, recovery, composition, or error mapping warrants a helper. Prefer specific domain shapes over loose object types.
- Keep one-off validators close to their boundary and reuse schemas that represent the same contract. Reserve `*.schema.ts` for database tables.
- Export a named `ThingSchema` and its inferred `Thing` type. Use [Core](core.md) for contracts shared across packages.

The [base TS config](../tools/tsconfig/tsconfig.base.json) uses Bundler resolution. Use workspace export subpaths across packages and let [Oxfmt](../tools/vite-plus/base-config.fmt.ts) sort imports. Run the [Vite+ checks](workflow.md) for type checking. For a focused lint exception use `// oxlint-disable-next-line <rule>` with the reason when it is non-obvious.
