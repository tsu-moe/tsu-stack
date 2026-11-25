# Database

Prefer text columns with a string-union type via Drizzle’s `$type<Type>()`. Keep persistence-only values with the schema and import shared domain values from [Core](core.md). Validate at I/O boundaries and enforce storage-critical invariants with database constraints. Document the reason for a native enum beside the schema.

## Schema changes and local migrations

Start local PostgreSQL with `vp run db:dev:start`. After a schema change, run `vp run db:generate` and inspect the migration. Before `vp run db:migrate`, verify the effective `DATABASE_URL` points to localhost or 127.0.0.1. Stop and tell the user if the destination is nonlocal. Use `vp run db:dev:stop` to stop Compose and `vp run db:studio` to inspect the database.

## Better Auth tables

Change the [auth config](../packages/auth/src/index.ts), run `vp run auth:generate`, and inspect [the generated schema](../packages/db/src/schema/auth.schema.ts). Keep it generated and consistent with the branch’s migration history. PostgreSQL and D1 each own their dialect’s schema and migration output.

Keep the main `defineRelations()` graph in the database package and merge Better Auth’s generated `defineRelationsPart()` after it. Narrow generated JSON fields at the application read boundary. Put constraints Better Auth cannot express in a separate schema or the owning authenticated transaction. See [Auth](auth.md) for client inference and session behavior.
