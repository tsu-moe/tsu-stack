import { createMiddleware } from "@tanstack/react-start";
import { createRequestLogger, type RequestLogger } from "evlog";

type RequestIdOptions = {
  limitLength?: number;
  headerName?: string;
  generator?: () => string;
};

type RequestContext = {
  requestId: string;
  request: {
    hostname: string;
    ip?: string;
    method: string;
    path: string;
    query?: Record<string, string>;
  };
};

type LoggerMiddlewareOptions = {
  context?: Record<string, unknown>;
  requestIdOptions?: RequestIdOptions;
  excludePaths?: string[];
  excludeIps?: string[];
};

const INVALID_REQUEST_ID_CHARS_REGEX = /[^\w\-=]/;
const FORWARDED_FOR_REGEX = /for=([^;,\s]+)/;
const IPV6_PREFIX_REGEX = /^::ffff:/i;

function injectRequestIdMiddleware(options: RequestIdOptions = {}) {
  const {
    limitLength = 255,
    headerName = "X-Request-Id",
    generator = () => crypto.randomUUID()
  } = options;

  return createMiddleware().server(({ next, request }) => {
    let reqId = headerName ? request.headers.get(headerName) : undefined;

    if (!reqId || reqId.length > limitLength || INVALID_REQUEST_ID_CHARS_REGEX.test(reqId)) {
      reqId = generator();
    }

    return next({
      context: {
        requestId: reqId
      }
    });
  });
}

const injectRequestMiddleware = createMiddleware().server(({ next, request }) => {
  const url = new URL(request.url);
  const realIp = getRealIpFromHeaders(request.headers);
  const query = Object.fromEntries(url.searchParams.entries());

  return next({
    context: {
      request: {
        hostname: url.hostname,
        ip: normalizeIp(realIp),
        method: request.method,
        path: url.pathname,
        query: Object.keys(query).length > 0 ? query : undefined
      }
    }
  });
});

function createSkipChecker(options: { excludePaths?: string[]; excludeIps?: string[] }) {
  const excludedIpsSet = new Set(options.excludeIps?.map((ip) => normalizeIp(ip)) ?? []);
  const excludedPaths = options.excludePaths ?? [];

  return (context: RequestContext) =>
    excludedPaths.some((pattern) => matchesPathPattern(context.request.path, pattern)) ||
    excludedIpsSet.has(context.request.ip ?? "");
}

function matchesPathPattern(path: string, pattern: string) {
  if (!pattern.includes("*")) {
    return path === pattern;
  }

  const regex = new RegExp(
    `^${pattern
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*")}$`
  );

  return regex.test(path);
}

async function withRequestLogging<T>(options: {
  context: RequestContext;
  loggerContext?: Record<string, unknown>;
  shouldSkip: boolean;
  execute: (logger: RequestLogger) => Promise<T>;
}): Promise<T> {
  const { context, execute, loggerContext, shouldSkip } = options;
  const logger = createRequestLogger({
    method: context.request.method,
    path: context.request.path,
    requestId: context.requestId
  });

  logger.set({
    ...context.request,
    ...loggerContext
  });

  try {
    const result = await execute(logger);
    if (!shouldSkip) {
      logger.emit();
    }
    return result;
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)));
    if (!shouldSkip) {
      logger.emit();
    }
    throw error;
  }
}

/**
 * Add evlog request context to TanStack Start server functions.
 *
 * The logger is passed through middleware context as `logger`.
 *
 * @example
 * ```ts
 * import { tanstackStartServerFnLoggerMiddleware } from "@tsu-stack/logger/server/tanstack-start/middleware";
 *
 * export const startInstance = createStart(() => ({
 *   functionMiddleware: [tanstackStartServerFnLoggerMiddleware()],
 * }));
 * ```
 */
export function tanstackStartServerFnLoggerMiddleware(options: LoggerMiddlewareOptions = {}) {
  const requestIdMiddleware = injectRequestIdMiddleware(options.requestIdOptions);
  const shouldSkip = createSkipChecker({ excludeIps: options.excludeIps });

  return createMiddleware({ type: "function" })
    .middleware([requestIdMiddleware, injectRequestMiddleware])
    .server(({ next, context }) =>
      withRequestLogging({
        context,
        execute: async (logger) =>
          next({
            context: {
              logger
            }
          }),
        loggerContext: options.context,
        shouldSkip: shouldSkip(context)
      })
    );
}

/**
 * Add evlog request logging to TanStack Start API routes.
 *
 * The logger is passed through middleware context as `logger`.
 *
 * @example
 * ```ts
 * import { tanstackStartRequestLoggerMiddleware } from "@tsu-stack/logger/server/tanstack-start/middleware";
 *
 * export const startInstance = createStart(() => ({
 *   requestMiddleware: [tanstackStartRequestLoggerMiddleware({ excludePaths: ["/health"] })],
 * }));
 * ```
 */
export function tanstackStartRequestLoggerMiddleware(options: LoggerMiddlewareOptions = {}) {
  const requestIdMiddleware = injectRequestIdMiddleware(options.requestIdOptions);
  const shouldSkip = createSkipChecker({
    excludeIps: options.excludeIps,
    excludePaths: options.excludePaths
  });

  return createMiddleware({ type: "request" })
    .middleware([requestIdMiddleware, injectRequestMiddleware])
    .server(({ next, context }) =>
      withRequestLogging({
        context,
        execute: async (logger) =>
          next({
            context: {
              logger
            }
          }),
        loggerContext: options.context,
        shouldSkip: shouldSkip(context)
      })
    );
}

function getRealIpFromHeaders(headers: Headers): string | undefined {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("true-client-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-client-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("forwarded")?.match(FORWARDED_FOR_REGEX)?.[1]
  );
}

function normalizeIp(ip: string | undefined): string | undefined {
  return ip?.replace(IPV6_PREFIX_REGEX, "");
}

declare module "@tanstack/react-start" {
  // @ts-expect-error - module augmentation to add our custom RouterAppContext to TanStack Router's createRouter generic
  type Register = {
    functionMiddleware: readonly [ReturnType<typeof tanstackStartServerFnLoggerMiddleware>];
    requestMiddleware: readonly [ReturnType<typeof tanstackStartRequestLoggerMiddleware>];
  };
}
