import { hostname } from "node:os";
import { join } from "node:path/posix";

import { SmartCoercionHandlerPlugin } from "@orpc/json-schema";
import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferenceHandlerPlugin } from "@orpc/openapi/plugins";
import { COMMON_ERROR_STATUS_MAP, ORPCError, onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { GetMethodCsrfProtectionHandlerPlugin, RethrowHandlerPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";
import { type ContentfulStatusCode } from "hono/utils/http-status";

import { createContext } from "@tsu-stack/api/lib/context/hono/create-context";
import { appRouter } from "@tsu-stack/api/routers/index";
import { createAuth, generateAuthOpenApiSchema } from "@tsu-stack/auth/index";
import { ENV_SERVER } from "@tsu-stack/env/server/env";
import { log, parseError } from "@tsu-stack/logger/server";
import {
  honoLogIngestionMiddleware,
  honoLoggerMiddleware,
  type HonoLogVariables
} from "@tsu-stack/logger/server/hono/middleware";

import "#@/shared/lib/logger";

const serverHostname = hostname();

export const app = new Hono<HonoLogVariables>().basePath(
  new URL(ENV_SERVER.VITE_SERVER_URL).pathname
);

app.use(
  "/*",
  secureHeaders({
    referrerPolicy: "strict-origin-when-cross-origin",
    strictTransportSecurity: ENV_SERVER.VITE_SERVER_URL.startsWith("https:")
  })
);

app.use(
  "/*",
  cors({
    allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    origin: [new URL(ENV_SERVER.VITE_WEB_URL).origin]
  })
);

const formCsrf = csrf({
  origin: [new URL(ENV_SERVER.VITE_WEB_URL).origin, new URL(ENV_SERVER.VITE_SERVER_URL).origin]
});

app.use("/*", (c, next) => {
  // A bodyless server-to-server POST has no browser origin or form content type.
  if (!c.req.header("origin") && !c.req.header("sec-fetch-site") && !c.req.header("content-type")) {
    return next();
  }
  return formCsrf(c, next);
});

app.use(
  "/*",
  honoLoggerMiddleware({
    exclude: ["**/health/**", "**/_logs/ingest"],
    enrich: (ctx) => {
      ctx.event.hostname = serverHostname;
    }
  })
);

app.post("/_logs/ingest", honoLogIngestionMiddleware());

// Apply the general cap after the log route, which has its own smaller limit.
app.use("/*", bodyLimit({ maxSize: 1024 * 1024 }));

app.onError((error, c) => {
  if (!(error instanceof HTTPException && error.status < 500)) {
    const requestLog = c.get("log");
    if (requestLog) {
      requestLog.error(error);
    } else {
      log.error({ event: "hono_global_error", error });
    }
  }

  const parsed = parseError(error);

  return c.json(
    {
      message: parsed.message,
      ...(parsed.code ? { code: parsed.code } : {}),
      ...(parsed.why ? { why: parsed.why } : {}),
      ...(parsed.fix ? { fix: parsed.fix } : {}),
      ...(parsed.link ? { link: parsed.link } : {})
    },
    parsed.status as ContentfulStatusCode
  );
});

/**
 * Disable /auth/reference calls as they are handled by the OpenAPI generator
 * @see https://better-auth.com/docs/plugins/open-api#configuration
 */
app.on(["POST", "GET"], "/auth/reference", (c) =>
  c.redirect(`${ENV_SERVER.VITE_SERVER_URL}/docs#auth-api-reference`, 301)
);

app.get("/auth/open-api/generate-schema", async (c) => {
  // IMPORTANT: Need to explicitly do this instead of relying on the OpenAPI plugin's built-in schema generation
  // Otherwise, it will 404 with the /auth/* endpoint
  const schema = await generateAuthOpenApiSchema();
  return c.json(schema);
});

app.on(["POST", "GET"], "/auth/*", (c) => createAuth().handler(c.req.raw));

const errorStatusMap = { ...COMMON_ERROR_STATUS_MAP, SERVICE_UNAVAILABLE: 503 };
const openApiGenerator = new OpenAPIGenerator({
  converters: [new ZodToJsonSchemaConverter()]
});

export const openApiHandler = new OpenAPIHandler(appRouter, {
  errorStatusMap,
  interceptors: [
    onError((error, { context }) => {
      context.logger.set({ handler: "openapi" });
      context.logger.error(error instanceof Error ? error : String(error));
    })
  ],
  plugins: [
    new SmartCoercionHandlerPlugin({
      converters: [new ZodToJsonSchemaConverter()]
    }),
    new OpenAPIReferenceHandlerPlugin({
      allow: ENV_SERVER.ENABLE_OPEN_API_DOCS,
      docsPath: "/docs",
      docsTitle: "@tsu-stack/server API Documentation",
      provider: "scalar",
      providerConfig: {
        sources: [
          {
            title: "API Reference",
            url: join(new URL(ENV_SERVER.VITE_SERVER_URL).pathname, "docs", "spec.json")
          },
          {
            title: "Auth API Reference",
            url: join(
              new URL(ENV_SERVER.VITE_SERVER_URL).pathname,
              "auth",
              "open-api",
              "generate-schema"
            )
          }
        ],
        theme: "deepSpace"
      },
      providerScriptUrl: "https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.76.4",
      spec: () =>
        openApiGenerator.generate(appRouter, {
          version: "3.1.1",
          errorStatusMap,
          base: {
            components: {
              securitySchemes: {
                authCookie: {
                  description: `**(optional)** Session cookie from signing-in, required for protected endpoints [View Auth Reference](${ENV_SERVER.VITE_SERVER_URL}/docs#auth-api-reference)`,
                  in: "cookie",
                  name: "better_auth.session_token",
                  type: "apiKey"
                }
              }
            },
            info: {
              description: `This is the API for @tsu-stack/server.\n## Usage\nFor authentication, you can sign in via the \`/sign-in\` endpoint in [the Auth Reference](${ENV_SERVER.VITE_SERVER_URL}/docs#auth-api-reference). Include the session cookie in subsequent requests to access protected endpoints.\n## Resources\n - [Official Website](${ENV_SERVER.VITE_WEB_URL})\n - [Auth API Reference](${ENV_SERVER.VITE_SERVER_URL}/docs#auth-api-reference)`,
              title: "@tsu-stack/server API",
              version: ENV_SERVER.SOURCE_COMMIT
            },
            servers: [
              {
                description: "Primary API Server",
                url: ENV_SERVER.VITE_SERVER_URL
              }
            ]
          }
        }),
      specPath: "/docs/spec.json"
    }),
    new GetMethodCsrfProtectionHandlerPlugin(),
    new RethrowHandlerPlugin({
      filter: (error) => !(error instanceof ORPCError)
    })
  ]
});

export const rpcHandler = new RPCHandler(appRouter, {
  errorStatusMap,
  interceptors: [
    onError((error, { context }) => {
      context.logger.set({ handler: "rpc" });
      context.logger.error(error instanceof Error ? error : String(error));
    })
  ],
  plugins: [new GetMethodCsrfProtectionHandlerPlugin()]
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c, logger: c.get("log") });

  // oRPC at /rpc/*
  const rpcResult = await rpcHandler.handle(c.req.raw, {
    context,
    prefix: join(new URL(ENV_SERVER.VITE_SERVER_URL).pathname, "rpc") as `/${string}`
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  // OpenAPI REST API at /*
  const openApiResult = await openApiHandler.handle(c.req.raw, {
    context,
    prefix: new URL(ENV_SERVER.VITE_SERVER_URL).pathname as `/${string}`
  });

  if (openApiResult.matched) {
    return c.newResponse(openApiResult.response.body, openApiResult.response);
  }

  await next();
});
