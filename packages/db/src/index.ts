import "@tanstack/react-start/server-only";
import { env } from "cloudflare:workers";
import { sql } from "drizzle-orm";
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";

import { authRelations } from "#@/schema/auth.schema";
import { relations } from "#@/schema/relations";

export * from "drizzle-orm/sql";

export function createDb(dbClient: AnyD1Database = env.DB) {
  return drizzle(dbClient, {
    // `defineRelationsPart()` must be merged after the main `defineRelations()` config.
    // https://orm.drizzle.team/docs/relations-v2#relations-parts
    relations: { ...relations, ...authRelations }
  });
}

export async function checkIsDbReady(): Promise<boolean> {
  try {
    await createDb().all(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}
