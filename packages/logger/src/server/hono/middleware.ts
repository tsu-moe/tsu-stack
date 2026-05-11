import { log, type DrainContext, type LogLevel } from "evlog";
import {
  evlog as createEvlogHonoMiddleware,
  type EvlogHonoOptions,
  type EvlogVariables
} from "evlog/hono";
import { type MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

const VALID_LEVELS = new Set<LogLevel>(["info", "error", "warn", "debug"]);

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
export type HonoLogVariables = EvlogVariables;

type HonoLoggerMiddlewareOptions = EvlogHonoOptions;

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
export function honoLoggerMiddleware(options?: HonoLoggerMiddlewareOptions): MiddlewareHandler {
  return createEvlogHonoMiddleware(options);
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
export function honoLogIngestionMiddleware(
  options: HonoLogIngestionOptions = {}
): MiddlewareHandler {
  const maxPayloadBytes = options.maxPayloadBytes ?? 64 * 1024;

  return createMiddleware(async (c) => {
    const contentLength = Number(c.req.header("content-length") ?? 0);
    if (contentLength > maxPayloadBytes) {
      throw new HTTPException(413, { message: "Log payload is too large" });
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      throw new HTTPException(400, { message: "Invalid JSON body" });
    }

    const batch = normalizeBatch(body);
    for (const payload of batch) {
      emitClientLog(payload);
    }

    return c.body(null, 204);
  });
}

function normalizeBatch(body: unknown): DrainContext[] {
  if (!Array.isArray(body)) {
    return [];
  }

  return body.filter(isDrainContext);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isDrainContext(value: unknown): value is DrainContext {
  return isRecord(value) && isRecord(value.event);
}

function normalizeLevel(value: unknown): LogLevel {
  if (typeof value !== "string" || !VALID_LEVELS.has(value as LogLevel)) {
    return "info";
  }

  return value as LogLevel;
}

function emitClientLog(payload: DrainContext) {
  const { level: _level, timestamp, ...event } = payload.event;
  const normalizedEvent: Record<string, unknown> = {
    ...(timestamp !== undefined && event.clientTimestamp === undefined
      ? { clientTimestamp: timestamp }
      : {}),
    ...event
  };

  if (payload.request?.method && normalizedEvent.method === undefined) {
    normalizedEvent.method = payload.request.method;
  }

  if (payload.request?.path && normalizedEvent.path === undefined) {
    normalizedEvent.path = payload.request.path;
  }

  if (payload.request?.requestId && normalizedEvent.requestId === undefined) {
    normalizedEvent.requestId = payload.request.requestId;
  }

  const clientEvent = {
    ...normalizedEvent,
    source: "client"
  };

  switch (normalizeLevel(payload.event.level)) {
    case "debug":
      log.debug(clientEvent);
      return;
    case "error":
      log.error(clientEvent);
      return;
    case "warn":
      log.warn(clientEvent);
      return;
    case "info":
      log.info(clientEvent);
      return;
  }
}
