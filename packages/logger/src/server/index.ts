import { defu } from "defu";
import {
  audit as recordAudit,
  auditRedactPreset,
  createError as createEvlogError,
  createLogger as createEvlogLogger,
  createRequestLogger as createEvlogRequestLogger,
  EvlogError,
  initLogger as initEvlogLogger,
  log as evlog,
  parseError as parseEvlogError,
  type LoggerConfig as EvlogLoggerConfig,
  type ParsedError as EvlogParsedError
} from "evlog";

import { LOG_SERVICES } from "#@/constants/services";
import { logSafely, normalizeAudit, standaloneLogger, type AuditInput, type LogFields } from "#@/server/runtime";

type ServerLoggerConfig = EvlogLoggerConfig;

export const REQUEST_LOG_SAMPLING = {
  keep: [{ status: 400 }, { duration: 1000 }],
  rates: {
    info: 0
  }
} satisfies NonNullable<ServerLoggerConfig["sampling"]>;

const DEFAULT_REDACT_PATHS = [
  ...(auditRedactPreset.paths ?? []),
  "BETTER_AUTH_SECRET",
  "DATABASE_URL",
  "confirmPassword",
  "cookies",
  "idToken"
  // TODO: Add more if you plan to use more sensitive paths
];

const DEFAULT_SERVER_LOGGER_CONFIG = {
  env: {
    service: LOG_SERVICES.DEFAULT
  },
  redact: {
    paths: DEFAULT_REDACT_PATHS,
    patterns: [/(?<=\nparams: )[^\n]*/g]
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

export { type AuditFields } from "evlog";
export type { RequestLogger } from "#@/server/runtime";

export function audit(input: AuditInput) {
  return logSafely(() => recordAudit(normalizeAudit(input))) ?? null;
}

/**
 * Create a standalone wide-event logger for jobs, scripts, or non-request work.
 *
 * @example
 * ```ts
 * import { createLogger } from "@tsu-stack/logger/server";
 *
 * const logger = createLogger({ operation: "user.sync" });
 * logger.outcome("user.synced", { users: { processed: 42 } });
 * logger.emit();
 * ```
 */
export function createLogger(fields?: LogFields) {
  return standaloneLogger(createEvlogLogger(), fields);
}

/**
 * Create a request-scoped wide-event logger when framework middleware is not in play.
 *
 * @example
 * ```ts
 * import { createRequestLogger } from "@tsu-stack/logger/server";
 *
 * const logger = createRequestLogger({ method: "GET", path: "/jobs" });
 * logger.outcome("job.listed");
 * logger.emit();
 * ```
 */
export function createRequestLogger(options?: Parameters<typeof createEvlogRequestLogger>[0]) {
  return standaloneLogger(createEvlogRequestLogger(options));
}

/**
 * Simple server-side logging API for one-off structured events.
 *
 * @example
 * ```ts
 * import { log } from "@tsu-stack/logger/server";
 *
 * log.error({ event: "rpc.request.failed", error });
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
 * Whether an error was created with `createError` and is safe to expose to clients.
 */
export const isEvlogError = (error: unknown): error is EvlogError => EvlogError.isEvlogError(error);

/**
 * Convert unknown thrown values into structured error fields. Unexpected error messages may
 * contain sensitive internal details and must not be returned directly to clients.
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
 * Parsed structured error returned by `parseError`.
 */
export type ParsedError = EvlogParsedError;
