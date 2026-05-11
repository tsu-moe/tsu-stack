import { defu } from "defu";
import {
  auditRedactPreset,
  createError as createEvlogError,
  createLogger as createEvlogLogger,
  createRequestLogger as createEvlogRequestLogger,
  initLogger as initEvlogLogger,
  log as evlog,
  parseError as parseEvlogError,
  type LoggerConfig as EvlogLoggerConfig,
  type ParsedError as EvlogParsedError,
  type RequestLogger as EvlogRequestLogger
} from "evlog";

import { LOG_SERVICES } from "#@/constants/services";

type ServerLoggerConfig = EvlogLoggerConfig;

const DEFAULT_REDACT_PATHS = [
  ...(auditRedactPreset.paths ?? []),
  "apiKey",
  "authorization",
  "cookie",
  "cookies",
  "password",
  "secret",
  "set-cookie",
  "token",
  "accessToken",
  "refreshToken"
];

const DEFAULT_SERVER_LOGGER_CONFIG = {
  env: {
    service: LOG_SERVICES.DEFAULT
  },
  redact: {
    paths: DEFAULT_REDACT_PATHS
  }
} satisfies ServerLoggerConfig;

let isInitialized = false;

/**
 * Initialize server-side evlog once for the current package.
 *
 * If `env.service` is omitted, logs use `LOG_SERVICES.DEFAULT`.
 *
 * @example
 * ```ts
 * import { LOG_SERVICES, initLogger } from "@tsu-stack/logger/server";
 *
 * initLogger({
 *   env: {
 *     environment: "production",
 *     service: LOG_SERVICES.WEB_SERVER,
 *     version: process.env.SOURCE_COMMIT,
 *   },
 * });
 * ```
 */
export function initLogger(config: ServerLoggerConfig = {}) {
  if (isInitialized) {
    return;
  }

  initEvlogLogger(defu(config, DEFAULT_SERVER_LOGGER_CONFIG) as ServerLoggerConfig);
  isInitialized = true;
}

/**
 * Stable service names for server logging.
 *
 * @example
 * ```ts
 * import { LOG_SERVICES } from "@tsu-stack/logger/server";
 *
 * initLogger({
 *   env: {
 *     service: LOG_SERVICES.WEB_SERVER,
 *   },
 * });
 * ```
 */
export { LOG_SERVICES };

/**
 * Create a standalone wide-event logger for jobs, scripts, or non-request work.
 *
 * @example
 * ```ts
 * import { createLogger } from "@tsu-stack/logger/server";
 *
 * const logger = createLogger({ operation: "sync_users" });
 * logger.set({ users: { processed: 42 } });
 * logger.emit();
 * ```
 */
export const createLogger = createEvlogLogger;

/**
 * Create a request-scoped wide-event logger when framework middleware is not in play.
 *
 * @example
 * ```ts
 * import { createRequestLogger } from "@tsu-stack/logger/server";
 *
 * const logger = createRequestLogger({ method: "GET", path: "/health" });
 * logger.emit({ status: 200 });
 * ```
 */
export const createRequestLogger = createEvlogRequestLogger;

/**
 * Simple server-side logging API for one-off structured events.
 *
 * @example
 * ```ts
 * import { log } from "@tsu-stack/logger/server";
 *
 * log.info({ event: "server_started", port: 5000 });
 * log.error({ event: "rpc_handler_error", error });
 * ```
 */
export const log = evlog;

/**
 * Create a structured error for request handlers and jobs.
 *
 * @example
 * ```ts
 * import { createError } from "@tsu-stack/logger/server";
 *
 * throw createError({
 *   message: "Checkout failed",
 *   status: 402,
 *   why: "Card declined by issuer",
 *   fix: "Try a different payment method",
 * });
 * ```
 */
export const createError = createEvlogError;

/**
 * Convert unknown thrown values into structured, response-safe error fields.
 *
 * @example
 * ```ts
 * import { parseError } from "@tsu-stack/logger/server";
 *
 * const parsed = parseError(error);
 * return c.json({ message: parsed.message }, parsed.status);
 * ```
 */
export const parseError = parseEvlogError;

/**
 * Request-scoped evlog logger provided by the framework middleware.
 *
 * @example
 * ```ts
 * import type { RequestLogger } from "@tsu-stack/logger/server";
 *
 * function addUserContext(logger: RequestLogger, userId: string) {
 *   logger.set({ user: { id: userId } });
 * }
 * ```
 */
export type RequestLogger = EvlogRequestLogger;

/**
 * Parsed structured error returned by `parseError`.
 */
export type ParsedError = EvlogParsedError;
