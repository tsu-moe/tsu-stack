import { createLogger } from "evlog";
import { evlog as createEvlogHonoMiddleware, type EvlogHonoOptions } from "evlog/hono";
import { type MiddlewareHandler } from "hono";
import { bodyLimit } from "hono/body-limit";
import { every } from "hono/combine";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { BROWSER_LOG_MAX_EVENTS, BrowserLogPayloadSchema } from "#@/browser-event";
import { REQUEST_ID_HEADER, resolveRequestId, type RequestIdOptions } from "#@/request-id";
import { logSafely, reportLoggingFailure, requestLogger, type RequestLogger } from "#@/server/runtime";

const ClientLogBatchSchema = z.array(BrowserLogPayloadSchema).max(BROWSER_LOG_MAX_EVENTS);

/**
 * Hono app variables added by `honoLoggerMiddleware()`.
 *
 * @example
 * ```ts
 * import { Hono } from "hono";
 * import { type HonoLogVariables } from "@tsu-stack/logger/server/hono/middleware";
 *
 * const app = new Hono<HonoLogVariables>();
 * ```
 */
export type HonoLogVariables = { Variables: { log: RequestLogger; requestId: string } };

type HonoLoggerMiddlewareOptions = EvlogHonoOptions & {
  requestIdOptions?: RequestIdOptions;
};

type HonoLogIngestionOptions = {
  maxPayloadBytes?: number;
};

/**
 * Add evlog request logging to a Hono app and expose the request logger as `c.get("log")`.
 *
 * @example
 * ```ts
 * import { honoLoggerMiddleware } from "@tsu-stack/logger/server/hono/middleware";
 *
 * app.use("/*", honoLoggerMiddleware());
 * app.get("/health", (c) => {
 *   c.get("log").set({ health: { live: true } });
 *   return c.json({ status: "healthy" });
 * });
 * ```
 */
export function honoLoggerMiddleware(options: HonoLoggerMiddlewareOptions = {}): MiddlewareHandler {
  const { requestIdOptions = {}, ...evlogOptions } = options;
  const evlogMiddleware = createEvlogHonoMiddleware({
    ...evlogOptions,
    async keep(ctx) {
      await evlogOptions.keep?.(ctx);
      if (typeof ctx.context?.event === "string") ctx.shouldKeep = true;
    }
  });

  return async (context, next) => {
    const { raw } = context.req;
    const requestId = resolveRequestId(raw.headers, requestIdOptions);
    if (raw.headers.get(REQUEST_ID_HEADER) !== requestId) {
      const headers = new Headers(raw.headers);
      headers.set(REQUEST_ID_HEADER, requestId);
      context.req.raw = new Request(raw, { headers });
    }
    context.set("requestId", requestId);
    context.header(requestIdOptions.headerName ?? REQUEST_ID_HEADER, requestId);

    let completed = false;
    try {
      return await evlogMiddleware(context, async () => {
        context.set("log", requestLogger(context.get("log")));
        await next();
        completed = true;
      });
    } catch (error) {
      if (!completed) throw error;
      reportLoggingFailure();
    }
  };
}

/**
 * Accept browser log events posted by `@tsu-stack/logger/client`.
 *
 * @example
 * ```ts
 * import { honoLogIngestionMiddleware } from "@tsu-stack/logger/server/hono/middleware";
 *
 * app.post("/_logs/ingest", honoLogIngestionMiddleware());
 * ```
 */
export function honoLogIngestionMiddleware(options: HonoLogIngestionOptions = {}): MiddlewareHandler {
  const maxPayloadBytes = options.maxPayloadBytes ?? 64 * 1024;

  return every(
    bodyLimit({
      maxSize: maxPayloadBytes,
      onError: () => {
        throw new HTTPException(413, { message: "Log payload is too large" });
      }
    }),
    createMiddleware(async (c) => {
      if (c.req.header("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
        throw new HTTPException(415, { message: "Expected application/json" });
      }

      const result = await c.req.json().then(
        (body) => ClientLogBatchSchema.safeParse(body),
        () => {
          throw new HTTPException(400, { message: "Invalid JSON body" });
        }
      );
      if (!result.success) {
        throw new HTTPException(422, { message: "Invalid log batch" });
      }

      for (const payload of result.data) {
        emitClientLog(payload);
      }

      return c.body(null, 204);
    })
  );
}

function emitClientLog(payload: z.output<typeof BrowserLogPayloadSchema>) {
  const { timestamp, ...event } = payload.event;
  logSafely(() =>
    createLogger({
      client: { ...event, clientTimestamp: timestamp, requestId: payload.request?.requestId },
      source: "client"
    }).emit({ _forceKeep: true })
  );
}
