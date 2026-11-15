import { createMiddleware, getGlobalStartContext } from "@tanstack/react-start";
import { createRequestLogger, type RequestLogger } from "evlog";

type LogContext = Parameters<RequestLogger["set"]>[0];

type RequestIdOptions = {
  limitLength?: number;
  headerName?: string;
  generator?: () => string;
};

type RequestContext = {
  requestId: string;
  request: {
    hostname: string;
    method: string;
    path: string;
  };
};

type LoggerMiddlewareOptions = {
  context?: LogContext;
  requestIdOptions?: RequestIdOptions;
  excludePaths?: string[];
};

const INVALID_REQUEST_ID_CHARS_REGEX = /[^\w\-=]/;

function injectRequestIdMiddleware(options: RequestIdOptions = {}) {
  const { limitLength = 255, headerName = "X-Request-Id", generator = () => crypto.randomUUID() } = options;

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

  return next({
    context: {
      request: {
        hostname: url.hostname,
        method: request.method,
        path: url.pathname
      }
    }
  });
});

function createSkipChecker(options: { excludePaths?: string[] }) {
  const excludedPaths = options.excludePaths ?? [];

  return (context: RequestContext) =>
    excludedPaths.some((pattern) => matchesPathPattern(context.request.path, pattern));
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
  loggerContext?: LogContext;
  shouldSkip: boolean;
  execute: (logger: RequestLogger) => Promise<T>;
  getStatus?: (result: T) => number | undefined;
}): Promise<T> {
  const { context, execute, getStatus, loggerContext, shouldSkip } = options;
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
      const status = getStatus?.(result);
      logger.emit(status === undefined ? undefined : { status });
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
 * Add one evlog request logger to every TanStack Start request, including server functions.
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
        getStatus: (result) => result.response.status,
        loggerContext: options.context,
        shouldSkip: shouldSkip(context)
      })
    );
}

export function getTanstackStartRequestLogger() {
  const logger = getOptionalTanstackStartRequestLogger();
  if (!logger) {
    throw new Error("TanStack Start request logger is unavailable");
  }
  return logger;
}

export function getOptionalTanstackStartRequestLogger() {
  const context = getGlobalStartContext() as { logger?: RequestLogger } | undefined;
  return context?.logger;
}

declare module "@tanstack/react-start" {
  // @ts-expect-error - module augmentation to add our custom RouterAppContext to TanStack Router's createRouter generic
  type Register = {
    requestMiddleware: readonly [ReturnType<typeof tanstackStartRequestLoggerMiddleware>];
  };
}
