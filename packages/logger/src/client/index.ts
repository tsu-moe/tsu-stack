import { initLogger as initEvlogLogger, log as evlogLog, type LogLevel } from "evlog";
import { createHttpLogDrain, type HttpLogDrainOptions } from "evlog/http";
import { type z } from "zod";

import { BROWSER_LOG_BATCH_SIZE, BrowserLogFieldsSchema, BrowserLogPayloadSchema } from "#@/browser-event";
import { LOG_SERVICES } from "#@/constants/services";

type ClientLoggerConfig = {
  batchedTransport?: HttpLogDrainOptions;
  console?: boolean;
  enabled?: boolean;
  minLevel?: NonNullable<Parameters<typeof initEvlogLogger>[0]>["minLevel"];
  pretty?: boolean;
  service?: string;
};

type BrowserLogInput = Omit<z.input<typeof BrowserLogFieldsSchema>, "user"> & { event: `${string}.${string}` };

const DEFAULT_CLIENT_LOGGER_CONFIG = {
  service: LOG_SERVICES.DEFAULT
} satisfies ClientLoggerConfig;

let isInitialized = false;
let userId: string | undefined;

function isBrowserRuntime() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Initialize browser logging with evlog's HTTP drain transport.
 *
 * @example
 * ```ts
 * import {
 *   LOG_SERVICES,
 *   initLog,
 * } from "@tsu-stack/logger/client";
 * import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";
 *
 * initLog({
 *   batchedTransport: {
 *     drain: {
 *       credentials: "include",
 *       endpoint: `${ENV_WEB_ISOMORPHIC.VITE_SERVER_URL.replace(/\/$/, "")}/_logs/ingest`,
 *     },
 *   },
 *   service: LOG_SERVICES.WEB_CLIENT,
 * });
 * ```
 */
export function initLog(config: ClientLoggerConfig = {}) {
  if (!isBrowserRuntime()) {
    return;
  }

  if (isInitialized) {
    return;
  }

  const transport = config.batchedTransport;
  const batch = transport?.pipeline?.batch;
  const service = BrowserLogPayloadSchema.shape.event.shape.service.safeParse(config.service);
  initEvlogLogger({
    drain: transport
      ? createHttpLogDrain({
          ...transport,
          pipeline: {
            ...transport.pipeline,
            batch: {
              intervalMs: batch?.intervalMs ?? 2000,
              size: Math.max(1, Math.min(batch?.size ?? BROWSER_LOG_BATCH_SIZE, BROWSER_LOG_BATCH_SIZE))
            }
          }
        })
      : undefined,
    enabled: config.enabled,
    env: {
      service: service.data ?? DEFAULT_CLIENT_LOGGER_CONFIG.service
    },
    minLevel: config.minLevel,
    pretty: config.pretty,
    redact: true,
    silent: config.console === false
  });
  isInitialized = true;
}

/**
 * Stable service names for browser logging.
 *
 * @example
 * ```ts
 * import { LOG_SERVICES } from "@tsu-stack/logger/client";
 *
 * initLog({ service: LOG_SERVICES.WEB_CLIENT });
 * ```
 */
export { LOG_SERVICES };

/**
 * Simple browser logging API. Object payloads automatically include the current identity context.
 *
 * @example
 * ```ts
 * import { log } from "@tsu-stack/logger/client";
 *
 * log.error({ event: "ui.error.caught", error: { name: error.name } });
 * ```
 */
export const log = {
  debug: browserLog("debug"),
  error: browserLog("error"),
  fatal: browserLog("fatal"),
  info: browserLog("info"),
  trace: browserLog("trace"),
  warn: browserLog("warn")
};

/**
 * Attach an opaque user ID to future browser log events.
 *
 * @example
 * ```ts
 * import { setIdentity } from "@tsu-stack/logger/client";
 *
 * setIdentity(user.id);
 * ```
 */
export function setIdentity(id: string) {
  if (!isBrowserRuntime()) {
    return;
  }

  userId = BrowserLogFieldsSchema.shape.user.unwrap().shape.id.safeParse(id).data;
}

/**
 * Clear browser identity context, usually on sign-out or provider cleanup.
 *
 * @example
 * ```ts
 * import { clearIdentity } from "@tsu-stack/logger/client";
 *
 * clearIdentity();
 * ```
 */
export function clearIdentity() {
  if (!isBrowserRuntime()) {
    return;
  }

  userId = undefined;
}

function browserLog(level: LogLevel) {
  return (input: BrowserLogInput) => {
    if (!isBrowserRuntime()) return;
    const result = BrowserLogFieldsSchema.safeParse({ ...input, user: userId ? { id: userId } : undefined });
    if (result.success) evlogLog[level](result.data);
  };
}
