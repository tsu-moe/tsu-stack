# Database

Prefer text columns with a string-union type via Drizzle’s `$type<Type>()`. Keep persistence-only values with the schema and import shared domain values from [Core](core.md). Validate at I/O boundaries and enforce storage-critical invariants with database constraints. Document the reason for a native enum beside the schema.

## Schema changes and local migrations

After a schema change, run `vp run db:generate` and review the SQL. Use `vp run db:migrate` to validate it against a disposable PostgreSQL database. `vp run db:push` applies schema changes directly and is for disposable databases by default. Use reviewed migrations for existing databases.

Before running a database command, resolve the target under the same environment as the command. For Drizzle, an exported `DATABASE_URL` normally takes precedence over `packages/env/.env` through dotenvx. Check any CLI or connection overrides too. Report only the effective host, port, and database name. Keep connection strings, credentials, and environment dumps out of output.

Verify that the endpoint belongs to the intended local PostgreSQL instance. With `vp run db:dev:start`, check the active Docker context, project, and published port. A loopback address can reach a tunnel, proxy, or an unrelated local server. Compose state persists across stops, so use a fresh database for disposable validation. Verify the target before opening `vp run db:studio`, which permits writes.

Get explicit user approval before migrating an existing or remote database, including through a loopback tunnel. Approval must cover the target and the actual operation, including schema push if requested. Follow [Human decisions](choice-flows.md).

## Better Auth tables

Change the [auth config](../packages/auth/src/index.ts), run `vp run auth:generate`, and inspect [the generated schema](../packages/db/src/schema/auth.schema.ts). Keep it generated and consistent with the branch’s migration history. PostgreSQL and D1 each own their dialect’s schema and migration output.

Keep the main `defineRelations()` graph in the database package and merge Better Auth’s generated `defineRelationsPart()` after it. Narrow generated JSON fields at the application read boundary. Put constraints Better Auth cannot express in a separate schema or the owning authenticated transaction. See [Auth](auth.md) for client inference and session behavior.
