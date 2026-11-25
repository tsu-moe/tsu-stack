import { createServerEntry } from "@tanstack/react-start/server";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { tanstackStartRequestLoggerMiddleware } from "#@/server/tanstack-start/middleware";

const requestLogger = vi.hoisted(() => {
  return {
    emit: vi.fn(),
    error: vi.fn(),
    getContext: vi.fn(() => {
      return {};
    }),
    set: vi.fn()
  };
});
const createRequestLogger = vi.hoisted(() => vi.fn(() => requestLogger));

vi.mock("evlog", () => {
  return { createRequestLogger };
});

type MiddlewareContext = {
  logger?: typeof requestLogger;
  request?: {
    hostname: string;
    method: string;
    path: string;
  };
  requestId?: string;
};
type MiddlewareResult = {
  context: MiddlewareContext;
  pathname: string;
  request: Request;
  response: Response;
};
type Middleware = {
  options: {
    middleware?: Middleware[];
    server?: (options: {
      context: MiddlewareContext;
      handlerType: "router";
      next: (options?: { context?: MiddlewareContext }) => Promise<MiddlewareResult>;
      pathname: string;
      request: Request;
    }) => Promise<MiddlewareResult>;
  };
};

async function runMiddleware(options: {
  middleware: ReturnType<typeof tanstackStartRequestLoggerMiddleware>;
  request: Request;
  response?: Response;
  throwError?: Error | Response;
}) {
  const middleware = options.middleware as unknown as Middleware;
  const chain = [...(middleware.options.middleware ?? []), middleware];
  let context: MiddlewareContext = {};
  let index = 0;

  const next = async (): Promise<MiddlewareResult> => {
    const current = chain[index++];
    if (!current?.options.server) {
      if (options.throwError) throw options.throwError;
      return {
        context,
        pathname: new URL(options.request.url).pathname,
        request: options.request,
        response: options.response ?? new Response(null, { status: 204 })
      };
    }

    return current.options.server({
      context,
      handlerType: "router",
      next: async (result) => {
        context = { ...context, ...result?.context };
        return next();
      },
      pathname: new URL(options.request.url).pathname,
      request: options.request
    });
  };

  return createServerEntry({ fetch: async () => (await next()).response }).fetch(options.request);
}

describe("tanstackStartRequestLoggerMiddleware", () => {
  beforeEach(() => vi.clearAllMocks());

  it("emits one request event with the response status and no forwarded IP metadata", async () => {
    const request = new Request("https://example.com/web/dashboard", {
      headers: {
        "x-forwarded-for": "198.51.100.10",
        "x-request-id": "request-123"
      }
    });

    const response = await runMiddleware({
      middleware: tanstackStartRequestLoggerMiddleware(),
      request,
      response: new Response(null, { status: 418 })
    });

    expect(createRequestLogger).toHaveBeenCalledOnce();
    expect(createRequestLogger).toHaveBeenCalledWith({
      method: "GET",
      path: "/web/dashboard",
      requestId: "request-123"
    });
    expect(requestLogger.set).toHaveBeenCalledWith({
      hostname: "example.com"
    });
    expect(requestLogger.emit).toHaveBeenCalledOnce();
    expect(requestLogger.emit).toHaveBeenCalledWith({ status: 418, _forceKeep: false });
    expect(response.headers.get("x-request-id")).toBe("request-123");
  });

  it("replaces an invalid request ID and records an error once", async () => {
    const error = new Error("boom");
    const request = new Request("https://example.com/web/dashboard", {
      headers: { "x-request-id": "invalid request id" }
    });

    const response = await runMiddleware({
      middleware: tanstackStartRequestLoggerMiddleware({
        requestIdOptions: { generator: () => "generated-request-id" }
      }),
      request,
      throwError: error
    });

    expect(response.status).toBe(500);
    expect(response.headers.get("x-request-id")).toBe("generated-request-id");
    expect(createRequestLogger).toHaveBeenCalledWith(expect.objectContaining({ requestId: "generated-request-id" }));
    expect(requestLogger.error).toHaveBeenCalledOnce();
    expect(requestLogger.error).toHaveBeenCalledWith(error);
    expect(requestLogger.emit).toHaveBeenCalledExactlyOnceWith({ status: 500 });
  });

  it("keeps the status and correlation header on a thrown response", async () => {
    const response = await runMiddleware({
      middleware: tanstackStartRequestLoggerMiddleware(),
      request: new Request("https://example.com/web/dashboard", { headers: { "X-Request-Id": "denial-1" } }),
      throwError: new Response(null, { status: 403 })
    });

    expect(response.status).toBe(403);
    expect(response.headers.get("x-request-id")).toBe("denial-1");
    expect(requestLogger.error).not.toHaveBeenCalled();
    expect(requestLogger.emit).toHaveBeenCalledExactlyOnceWith({ status: 403 });
  });

  it.each(["/_api/health/live", "/web/_api/health/live", "/prefix/web/_api/health/live"])(
    "excludes health checks at %s",
    async (path) => {
      const response = await runMiddleware({
        middleware: tanstackStartRequestLoggerMiddleware({ excludePaths: ["**/_api/health/**"] }),
        request: new Request(`https://example.com${path}`)
      });
      expect(response.status).toBe(204);
      expect(requestLogger.emit).not.toHaveBeenCalled();
    }
  );

  it("keeps a successful response when emission fails", async () => {
    const report = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      requestLogger.emit.mockImplementationOnce(() => {
        throw new Error("logging failed");
      });
      const response = await runMiddleware({
        middleware: tanstackStartRequestLoggerMiddleware(),
        request: new Request("https://example.com/web/dashboard")
      });
      expect(response.status).toBe(204);
      expect(requestLogger.error).not.toHaveBeenCalled();
      expect(requestLogger.emit).toHaveBeenCalledOnce();
      expect(report).toHaveBeenCalledWith("[tsu-stack/logger] Failed to record telemetry");
    } finally {
      report.mockRestore();
    }
  });
});
