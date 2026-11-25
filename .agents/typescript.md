# TypeScript

Infer types from the schema, API, or producer that owns them. Correct the source type when it is wrong. Keep assertions next to the evidence for the fact TypeScript cannot express. Use `satisfies` to check configuration without widening inference.

- Parse untrusted data at the nearest I/O boundary with the owner’s validator or Zod. Use `parse` or `safeParse` directly unless decoding, normalization, recovery, composition, or error mapping warrants a helper. Prefer specific domain shapes over loose object types.
- Keep one-off schemas inline and colocate reused schemas with their owner. In a web slice, start shared types in `types/index.ts` and split into descriptive `*.type.ts` files when needed. Reserve `*.schema.ts` for database tables.
- Export a named `ThingSchema` and its inferred `Thing` type. Use [Core](core.md) for contracts shared across packages.
- Use `lib/` for business logic and integrations and `utils/` for pure helpers. Keep abstractions and inference simple.

The [base TS config](../tools/tsconfig/tsconfig.base.json) uses Bundler resolution. Use workspace export subpaths across packages, `#@/` within packages that declare it, and `@/` in the web app. [Oxfmt](../tools/vite-plus/base-config.fmt.ts) sorts imports from builtins, external, and workspace through FSD layers from `shared` to `pages`. Run the [Vite+ checks](workflow.md) for type checking. For a focused lint exception use `// oxlint-disable-next-line <rule>` with the reason when it is non-obvious.
