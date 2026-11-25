# Database

Use SQLite text columns with a string-union type via Drizzle’s `$type<Type>()`. Keep persistence-only values with the schema and import shared values from [Core](core.md). Validate at I/O boundaries and enforce storage-critical invariants with database constraints.

## Schema changes and local migrations

After a schema change, run `vp run db:generate` and inspect the SQLite migration. Use `vp run db:migrate:local` to apply and test it against Wrangler’s local `DB` binding. Wrangler owns remote migrations. Confirm the target account and binding and obtain explicit authorization before `vp run db:migrate:remote` or `vp run deploy`, which applies remote migrations before deployment.

## Better Auth tables

Change the [auth config](../packages/auth/src/index.ts), run `vp run auth:generate` through its [CLI-only entry point](../packages/auth/src/generate.ts), and inspect [the generated schema](../packages/db/src/schema/auth.schema.ts). Keep it generated and consistent with the branch’s migration history. PostgreSQL and D1 each own their dialect’s schema and migration output.

Build `createDb()` at the call site from the current Worker binding. Merge Better Auth’s generated `defineRelationsPart()` after the main `defineRelations()` graph. Better Auth uses the SQLite provider with millisecond integer timestamps and SQLite booleans. Narrow generated JSON at the read boundary. Enforce additional constraints in schema or the owning authenticated write. See [Auth](auth.md) and [Worker bindings](environment-variables.md).
