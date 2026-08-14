import { initLogger as initEvlogLogger, log as evlogLog } from "evlog";
import { createHttpLogDrain, type HttpLogDrainOptions } from "evlog/http";

import { LOG_SERVICES } from "#@/constants/services";

type ClientLoggerConfig = {
  batchedTransport?: HttpLogDrainOptions;
  console?: boolean;
  enabled?: boolean;
  minLevel?: NonNullable<Parameters<typeof initEvlogLogger>[0]>["minLevel"];
  pretty?: boolean;
  service?: string;
};

type LogMethod = typeof evlogLog.info;
type ErrorLogMethod = typeof evlogLog.error;
type LogEvent = Parameters<LogMethod>[0];

const DEFAULT_CLIENT_LOGGER_CONFIG = {
  service: LOG_SERVICES.DEFAULT
} satisfies ClientLoggerConfig;

let isInitialized = false;
let identityContext: LogEvent = {};

const debugLogMethod = evlogLog.debug.bind(evlogLog) as LogMethod;
const errorLogMethod = evlogLog.error.bind(evlogLog) as ErrorLogMethod;
const infoLogMethod = evlogLog.info.bind(evlogLog) as LogMethod;
const warnLogMethod = evlogLog.warn.bind(evlogLog) as LogMethod;

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

  initEvlogLogger({
    drain: config.batchedTransport ? createHttpLogDrain(config.batchedTransport) : undefined,
    enabled: config.enabled,
    env: {
      service: config.service ?? DEFAULT_CLIENT_LOGGER_CONFIG.service
    },
    minLevel: config.minLevel,
    pretty: config.pretty,
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
 * log.info({ event: "page_view", path: location.pathname });
 * log.error({ event: "global_error_boundary", error });
 * ```
 */
export const log = {
  debug: withIdentity(debugLogMethod),
  error: withIdentity(errorLogMethod),
  info: withIdentity(infoLogMethod),
  warn: withIdentity(warnLogMethod)
} satisfies typeof evlogLog;

/**
 * Attach user/session context to future browser log events.
 *
 * @example
 * ```ts
 * import { setIdentity } from "@tsu-stack/logger/client";
 *
 * setIdentity({ user: { id: user.id } });
 * ```
 */
export function setIdentity(identity: LogEvent) {
  if (!isBrowserRuntime()) {
    return;
  }

  identityContext = { ...identity };
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

  identityContext = {};
}

function withIdentity(method: ErrorLogMethod): ErrorLogMethod;
function withIdentity(method: LogMethod): LogMethod;
function withIdentity(method: LogMethod | ErrorLogMethod) {
  function logWithIdentity(event: LogEvent): void;
  function logWithIdentity(error: Error): void;
  function logWithIdentity(tag: string, message: string): void;
  function logWithIdentity(tagOrEvent: Error | LogEvent | string, message?: string) {
    if (!isBrowserRuntime()) {
      return;
    }

    const invoke = method as (tagOrEvent: Error | LogEvent | string, message?: string) => void;

    if (tagOrEvent instanceof Error && message === undefined) {
      invoke(tagOrEvent);
      return;
    }

    if (isRecord(tagOrEvent) && message === undefined) {
      invoke({
        ...identityContext,
        ...tagOrEvent
      });
      return;
    }

    if (typeof tagOrEvent === "string") {
      if (message !== undefined) {
        invoke(tagOrEvent, message);
      }
      return;
    }

    invoke(tagOrEvent);
  }

  return logWithIdentity;
}

function isRecord(value: Error | LogEvent | string): value is LogEvent {
  return !!value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Error);
}
