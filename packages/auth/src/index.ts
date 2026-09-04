import { join } from "node:path/posix";

import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import "@tanstack/react-start/server-only";
import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";

import { createDb } from "@tsu-stack/db";
import * as schema from "@tsu-stack/db/schema";
import { ENV_SERVER } from "@tsu-stack/env/server/env";

export function createAuth() {
  const db = createDb();

  return betterAuth({
    baseURL: new URL(ENV_SERVER.VITE_SERVER_URL).origin,
    basePath: join(new URL(ENV_SERVER.VITE_SERVER_URL).pathname, "auth"),
    trustedOrigins: [new URL(ENV_SERVER.VITE_WEB_URL).origin],
    secret: ENV_SERVER.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema
    }),

    // https://www.better-auth.com/docs/concepts/session-management#session-caching
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60 // 5 minutes
      }
    },

    // https://www.better-auth.com/docs/authentication/email-password
    emailAndPassword: {
      enabled: true
    },

    advanced: {
      database: {
        // https://www.better-auth.com/docs/adapters/drizzle#joins
        joins: true
      }
    },

    plugins: [
      openAPI({
        theme: "deepSpace"
      })
    ]
  });
}

type OpenApiEndpoints = ReturnType<typeof openAPI>["endpoints"];

// Better Auth exposes this endpoint at runtime, but currently omits it from the
// inferred `auth.api` type: https://github.com/better-auth/better-auth/issues/8688
export function generateAuthOpenApiSchema() {
  const auth = createAuth();
  const api = auth.api as typeof auth.api & Pick<OpenApiEndpoints, "generateOpenAPISchema">;
  return api.generateOpenAPISchema();
}

export type AuthSession = ReturnType<typeof createAuth>["$Infer"]["Session"];
