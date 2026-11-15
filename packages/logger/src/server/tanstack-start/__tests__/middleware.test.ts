import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { tanstackStartRequestLoggerMiddleware } from "#@/server/tanstack-start/middleware";

const requestLogger = vi.hoisted(() => {
  return {
    emit: vi.fn(),
    error: vi.fn(),
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
  throwError?: Error;
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

  return next();
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

    const result = await runMiddleware({
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
      hostname: "example.com",
      method: "GET",
      path: "/web/dashboard"
    });
    expect(requestLogger.emit).toHaveBeenCalledOnce();
    expect(requestLogger.emit).toHaveBeenCalledWith({ status: 418 });
    expect(result.response.headers.get("x-request-id")).toBe("request-123");
  });

  it("replaces an invalid request ID and records an error once", async () => {
    const error = new Error("boom");
    const request = new Request("https://example.com/web/dashboard", {
      headers: { "x-request-id": "invalid request id" }
    });

    await expect(
      runMiddleware({
        middleware: tanstackStartRequestLoggerMiddleware({
          requestIdOptions: { generator: () => "generated-request-id" }
        }),
        request,
        throwError: error
      })
    ).rejects.toThrow(error);

    expect(createRequestLogger).toHaveBeenCalledWith(expect.objectContaining({ requestId: "generated-request-id" }));
    expect(requestLogger.error).toHaveBeenCalledOnce();
    expect(requestLogger.error).toHaveBeenCalledWith(error);
    expect(requestLogger.emit).toHaveBeenCalledOnce();
  });
});
