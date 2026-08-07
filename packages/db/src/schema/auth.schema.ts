import { defineRelationsPart, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestamp = (name: string) => integer(name, { mode: "timestamp_ms" });
const now = sql`(unixepoch() * 1000)`;

export const user = sqliteTable("user", {
  createdAt: timestamp("created_at").default(now).notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  updatedAt: timestamp("updated_at")
    .default(now)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull()
});

export const session = sqliteTable(
  "session",
  {
    createdAt: timestamp("created_at").default(now).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    ipAddress: text("ip_address"),
    token: text("token").notNull().unique(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = sqliteTable(
  "account",
  {
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    accountId: text("account_id").notNull(),
    createdAt: timestamp("created_at").default(now).notNull(),
    id: text("id").primaryKey(),
    idToken: text("id_token"),
    password: text("password"),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = sqliteTable(
  "verification",
  {
    createdAt: timestamp("created_at").default(now).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    updatedAt: timestamp("updated_at")
      .default(now)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    value: text("value").notNull()
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const relations = defineRelationsPart({ account, session, user, verification }, (r) => {
  return {
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id
      })
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id
      })
    },
    user: {
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId
      }),
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId
      })
    }
  };
});
