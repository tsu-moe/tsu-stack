import { join } from "node:path";

import "@tanstack/react-start/server-only";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { ENV_SERVER } from "@tsu-stack/env/server/env";
import { createLogger } from "@tsu-stack/logger/server";

import { authRelations } from "#@/schema/auth.schema";
import { relations } from "#@/schema/relations";

export * from "drizzle-orm/sql";

const client = postgres(ENV_SERVER.DATABASE_URL);

export const db = drizzle({
  client,
  // `defineRelationsPart()` must be merged after the main `defineRelations()` config.
  // https://orm.drizzle.team/docs/relations-v2#relations-parts
  relations: { ...relations, ...authRelations }
});

export async function checkIsDbReady(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}

let migrationFnCalled = false;
const MIGRATION_MAX_ATTEMPTS = 3;
const MIGRATION_RETRY_DELAY_MS = 3_000;

/**
 * Runs pending database migrations on startup.
 * Safe to call every time the server starts since Drizzle tracks applied migrations
 * in the __drizzle_migrations table and skips anything already applied.
 */
export async function migrateDatabase(): Promise<void> {
  if (migrationFnCalled || ENV_SERVER.IS_BUILD || ENV_SERVER.NODE_ENV !== "production") {
    return;
  }

  migrationFnCalled = true;
  const log = createLogger({ operation: "database.migrate" });

  for (let attempt = 1; attempt <= MIGRATION_MAX_ATTEMPTS; attempt++) {
    try {
      await migrate(db, {
        migrationsFolder: join(import.meta.dirname, "migrations")
      });
    } catch (error) {
      if (attempt === MIGRATION_MAX_ATTEMPTS) {
        log.error(error instanceof Error ? error : String(error));
        log.outcome("database.migration.failed", {
          attempt,
          maxAttempts: MIGRATION_MAX_ATTEMPTS
        });
        log.emit();
        throw error;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, MIGRATION_RETRY_DELAY_MS);
      });
      continue;
    }

    log.outcome("database.migration.completed", { attempt });
    log.emit();
    return;
  }
}
