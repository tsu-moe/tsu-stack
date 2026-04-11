import { join } from "node:path";

import "@tanstack/react-start/server-only";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { ENV_SERVER } from "@tsu-stack/env/server/env";
import { LOGGER_CATEGORIES_SERVER, getLogger } from "@tsu-stack/logger/server";

const logger = getLogger(LOGGER_CATEGORIES_SERVER.SERVER_DB);

import * as schemas from "#@/schema/index";
import { relations } from "#@/schema/relations";

export * from "drizzle-orm/sql";

const { relations: authRelations, ...schema } = schemas;

const client = postgres(ENV_SERVER.DATABASE_URL);

export const db = drizzle({
  client,
  schema,
  // IMPORTANT: authRelations must come first, since it's using defineRelations as the main relation
  // https://orm.drizzle.team/docs/relations-v2#relations-parts
  relations: { ...authRelations, ...relations },
  casing: "snake_case",
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

/**
 * Runs pending database migrations on startup.
 * Safe to call every time the server starts since Drizzle tracks applied migrations
 * in the __drizzle_migrations table and skips anything already applied.
 */
export async function migrateDatabase(): Promise<void> {
  const childLogger = logger.with({ fn: "migrateDatabase" });

  if (migrationFnCalled) {
    childLogger.debug("[{fn}] Skipping database migration (already called)");
    return;
  }

  migrationFnCalled = true;

  if (ENV_SERVER.IS_BUILD) {
    childLogger.info("[{fn}] Skipping database migration during build process: ({env})", {
      env: ENV_SERVER.NODE_ENV,
    });
    return;
  }

  if (ENV_SERVER.NODE_ENV !== "production") {
    childLogger.info("[{fn}] Skipping database migration in non-production environment: ({env})", {
      env: ENV_SERVER.NODE_ENV,
    });
    return;
  }

  childLogger.info("⏳ Migrating database...");
  try {
    await migrate(db, {
      migrationsFolder: join(import.meta.dirname, "migrations"),
    });
    childLogger.info("[{fn}] ✅ Database migration completed");
  } catch (error) {
    childLogger.error("[{fn}] ❌ Database migration failed {error}", { error });
  }
}
