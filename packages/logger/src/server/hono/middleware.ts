import { log } from "evlog";
import {
  evlog as createEvlogHonoMiddleware,
  type EvlogHonoOptions,
  type EvlogVariables
} from "evlog/hono";
import { type MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const NormalizedLogLevelSchema = z.enum(["info", "error", "warn", "debug"]).catch("info");

const ClientLogPayloadSchema = z.object({
  event: z
    .object({
      environment: z.string(),
      level: z.string(),
      service: z.string(),
      timestamp: z.string()
    })
    .catchall(z.json()),
  request: z
    .object({
      method: z.string().optional(),
      path: z.string().optional(),
      requestId: z.string().optional()
    })
    .optional()
});

const ClientLogBatchSchema = z.array(ClientLogPayloadSchema);

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

type ClientLogPayload = z.infer<typeof ClientLogPayloadSchema>;

type NormalizedEvent = Omit<ClientLogPayload["event"], "level" | "timestamp"> & {
  clientTimestamp?: string;
  method?: string;
  path?: string;
  requestId?: string;
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

    const result = await c.req.json().then(
      (body) => ClientLogBatchSchema.safeParse(body),
      () => {
        throw new HTTPException(400, { message: "Invalid JSON body" });
      }
    );
    const batch = result.success ? result.data : [];
    for (const payload of batch) {
      emitClientLog(payload);
    }

    return c.body(null, 204);
  });
}

function emitClientLog(payload: ClientLogPayload) {
  const { level: _level, timestamp, ...event } = payload.event;
  const normalizedEvent: NormalizedEvent = {
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

  switch (NormalizedLogLevelSchema.parse(payload.event.level)) {
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
