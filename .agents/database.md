# Database Conventions

## Typed Text over Native Enums

- Prefer database text columns with TypeScript string-union types over native database enums.
- Put reusable database value types in the database schema boundary and apply them with Drizzle's `$type<Type>()`.
- Introduce a native enum only for a concrete database-level requirement and document that requirement beside the schema.
- Type-level constraints do not validate untrusted runtime values. Validate system boundaries and use database checks where the invariant must be enforced by storage.

```ts
export type ProductVisibility = "draft" | "public" | "unlisted" | "archived";

visibility: text().$type<ProductVisibility>().notNull().default("public");
```

## Generated Better Auth Schema

- `packages/db/src/schema/auth.schema.ts` is generated through the owning branch's Better Auth CLI entrypoint by `vp run auth:generate`.
- Do not edit the generated auth schema directly. Change Better Auth configuration, regenerate, and inspect the resulting diff.
- Keep the generated schema and the branch's baseline migration synchronized so newly scaffolded projects start at the current schema.
- PostgreSQL and Cloudflare D1 branches own dialect-specific generated schemas and migration baselines; do not copy one dialect's output into another.
- If the generator leaves a JSON field as `unknown`, validate and narrow it at the first application read boundary rather than annotating the generated schema.
- Keep constraints that Better Auth cannot express in a separate schema or enforce them in the relevant authenticated transaction.
