import { join } from "node:path/posix";

import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import "@tanstack/react-start/server-only";
import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { isProduction } from "std-env";

import { db } from "@tsu-stack/db";
import * as schema from "@tsu-stack/db/schema";
import { ENV_SERVER } from "@tsu-stack/env/server/env";

export const auth = betterAuth({
  baseURL: new URL(ENV_SERVER.VITE_SERVER_URL).origin,
  basePath: join(new URL(ENV_SERVER.VITE_SERVER_URL).pathname, "auth"),
  trustedOrigins: [new URL(ENV_SERVER.VITE_WEB_URL).origin],
  secret: ENV_SERVER.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  // https://www.better-auth.com/docs/concepts/session-management#session-caching
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // https://www.better-auth.com/docs/authentication/email-password
  emailAndPassword: {
    enabled: true,
  },

  experimental: {
    // https://www.better-auth.com/docs/adapters/drizzle#joins-experimental
    joins: true,
  },

  plugins: [
    openAPI({
      theme: "deepSpace",
    }),
  ],

  advanced: {
    // The API and web app MUST be on the same host (path-based routing).
    // e.g. app.example.com/app + app.example.com/server
    //
    // This avoids Safari ITP issues entirely and allows the strongest cookie settings:
    //   - SameSite=Strict in production: cookies are never sent on cross-site requests
    //   - SameSite=None in development: Safari doesn't accept Secure without a certificate on localhost
    //
    // secure: true in production - cookie only sent over HTTPS, prevents interception
    // httpOnly: true - cookie inaccessible to JS, prevents XSS-based token theft
    defaultCookieAttributes: {
      sameSite: isProduction ? "strict" : "none",
      httpOnly: true,
      secure: true,
    },

    telemetry: {
      enabled: false,
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
