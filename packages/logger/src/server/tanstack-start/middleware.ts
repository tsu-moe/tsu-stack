import { createMiddleware, getGlobalStartContext } from "@tanstack/react-start";
import { getResponseStatus, setResponseHeader } from "@tanstack/react-start/server";
import { createRequestLogger } from "evlog";

import { REQUEST_ID_HEADER, resolveRequestId, type RequestIdOptions } from "#@/request-id";
import { logSafely, requestLogger, type LogFields, type RequestLogger } from "#@/server/runtime";

type LoggerMiddlewareOptions = {
  context?: LogFields;
  requestIdOptions?: RequestIdOptions;
  excludePaths?: string[];
};

function injectRequestIdMiddleware(options: RequestIdOptions = {}) {
  return createMiddleware().server(({ next, request }) =>
    next({
      context: {
        requestId: resolveRequestId(request.headers, options)
      }
    })
  );
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

function requestErrorStatus(error: unknown) {
  if (error instanceof Response) return error.status;
  const responseStatus = getResponseStatus();
  if (responseStatus >= 400) return responseStatus;
  if (typeof error !== "object" || error === null) return 500;

  const code = ("status" in error ? error.status : undefined) ?? ("statusCode" in error ? error.statusCode : undefined);
  const status = typeof code === "string" || typeof code === "number" ? Number(code) : 500;
  return Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500;
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
  const exclusions = options.excludePaths?.map((pattern) => {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^${escaped.replace(/\*\*|\*/g, (token) => (token === "**" ? ".*" : "[^/]*"))}$`);
  });

  return createMiddleware({ type: "request" })
    .middleware([requestIdMiddleware, injectRequestMiddleware])
    .server(async ({ next, context }) => {
      const headerName = options.requestIdOptions?.headerName ?? REQUEST_ID_HEADER;
      setResponseHeader(headerName, context.requestId);
      const { hostname, method, path } = context.request;
      const logger = createRequestLogger({ method, path, requestId: context.requestId });
      const scopedLogger = requestLogger(logger);
      const shouldEmit = !exclusions?.some((pattern) => pattern.test(path));
      logSafely(() => logger.set({ hostname, ...options.context }));

      let result: Awaited<ReturnType<typeof next>>;
      try {
        result = await next({ context: { logger: scopedLogger } });
      } catch (error) {
        if (shouldEmit) {
          logSafely(() => {
            const status = requestErrorStatus(error);
            if (status >= 500) scopedLogger.error(error);
            logger.emit({ status });
          });
        }
        throw error;
      }

      if (shouldEmit) {
        logSafely(() =>
          logger.emit({
            status: result.response.status,
            _forceKeep: typeof logger.getContext().event === "string"
          })
        );
      }
      const { response } = result;
      if (response.headers.get(headerName) === context.requestId) return result;

      const headers = new Headers(response.headers);
      headers.set(headerName, context.requestId);
      return {
        ...result,
        response: new Response(response.body, { headers, status: response.status, statusText: response.statusText })
      };
    });
}

export function getTanstackStartRequestLogger() {
  const context = getGlobalStartContext() as { logger?: RequestLogger } | undefined;
  if (!context?.logger) {
    throw new Error("TanStack Start request logger is unavailable");
  }
  return context.logger;
}

declare module "@tanstack/react-start" {
  // @ts-expect-error - module augmentation to add our custom RouterAppContext to TanStack Router's createRouter generic
  type Register = {
    requestMiddleware: readonly [ReturnType<typeof tanstackStartRequestLoggerMiddleware>];
  };
}
