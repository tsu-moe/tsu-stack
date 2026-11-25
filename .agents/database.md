# Database

Use SQLite text columns with a string-union type via Drizzle’s `$type<Type>()`. Keep persistence-only values with the schema and import shared values from [Core](core.md). Validate at I/O boundaries and enforce storage-critical invariants with database constraints.

## Schema changes and local migrations

After a schema change, run `vp run db:generate` and inspect the SQLite migration. Use `vp run db:migrate:local --persist-to <new-directory>` for disposable validation. Wrangler's default local state persists across runs, so it can contain existing data. Use the same local persistence directory when inspecting a test database.

## Remote D1 migrations

Before using `vp run db:migrate:remote`, verify the authenticated Cloudflare account, the effective Worker environment, and the `DB` binding's database name and ID. Check the app-local Wrangler config, inherited settings such as `CLOUDFLARE_ENV`, and any config or environment flags. Keep tokens and environment dumps out of output.

Get explicit user approval for the migration and target before applying. `vp run deploy` applies remote migrations before uploading the Worker. Check both stages' effective targets and get approval that covers both operations. Follow [Human decisions](choice-flows.md).

## Better Auth tables

Change the [auth config](../packages/auth/src/index.ts), run `vp run auth:generate` through its [CLI-only entry point](../packages/auth/src/generate.ts), and inspect [the generated schema](../packages/db/src/schema/auth.schema.ts). Keep it generated and consistent with the branch’s migration history. PostgreSQL and D1 each own their dialect’s schema and migration output.

Build `createDb()` at the call site from the current Worker binding. Merge Better Auth’s generated `defineRelationsPart()` after the main `defineRelations()` graph. Better Auth uses the SQLite provider with millisecond integer timestamps and SQLite booleans. Narrow generated JSON at the read boundary. Enforce additional constraints in schema or the owning authenticated write. See [Auth](auth.md) and [Worker bindings](environment-variables.md).
