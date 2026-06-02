import { join } from "node:path";

import "@tanstack/react-start/server-only";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { ENV_SERVER } from "@tsu-stack/env/server/env";
import { createLogger } from "@tsu-stack/logger/server";

import { relations as authRelations } from "#@/schema/auth.schema";
import { relations } from "#@/schema/relations";

export * from "drizzle-orm/sql";

export function createDb() {
  const client = postgres(ENV_SERVER.DATABASE_URL, {
    max: 1
  });

  return drizzle({
    client,
    // `defineRelationsPart()` must be merged after the main `defineRelations()` config.
    // https://orm.drizzle.team/docs/relations-v2#relations-parts
    relations: { ...relations, ...authRelations }
  });
}

export async function checkIsDbReady(): Promise<boolean> {
  try {
    await createDb().execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}

let migrationFnCalled = false;

/**
 * Runs pending database migrations on startup.
 * Safe to call every time the server starts since Drizzle tracks applied migrations
 * in the __drizzle_migrations table and skips anything already applied.
 */
export async function migrateDatabase(): Promise<void> {
  const log = createLogger({ operation: "server__database_migration" });

  if (migrationFnCalled) {
    log.emit({ event: "database_migration_skipped", reason: "already_called" });
    return;
  }

  migrationFnCalled = true;

  if (ENV_SERVER.IS_BUILD) {
    log.emit({
      environment: ENV_SERVER.NODE_ENV,
      event: "database_migration_skipped",

      reason: "build_process"
    });
    return;
  }

  if (ENV_SERVER.NODE_ENV !== "production") {
    log.emit({
      environment: ENV_SERVER.NODE_ENV,
      event: "database_migration_skipped",

      reason: "non_production"
    });
    return;
  }

  try {
    await migrate(createDb(), {
      migrationsFolder: join(import.meta.dirname, "migrations")
    });
    log.emit({ event: "database_migration_completed" });
  } catch (error) {
    log.error(error instanceof Error ? error : String(error), {
      event: "database_migration_failed"
    });
    log.emit({ _forceKeep: true });
  }
}
