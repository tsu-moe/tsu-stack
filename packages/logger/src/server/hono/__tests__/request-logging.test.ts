import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { honoLoggerMiddleware, type HonoLogVariables } from "#@/server/hono/middleware";

const requestLogger = vi.hoisted(() => {
  return { set: vi.fn() };
});

vi.mock("evlog/hono", () => {
  return {
    evlog: () => async (context: { set: (key: string, value: unknown) => void }, next: () => Promise<void>) => {
      context.set("log", requestLogger);
      await next();
    }
  };
});

const app = new Hono<HonoLogVariables>();
app.use(
  "/*",
  honoLoggerMiddleware({
    requestIdOptions: { generator: () => "generated-request-id" }
  })
);
app.get("/", (context) => context.body(null, 204));

describe("honoLoggerMiddleware request IDs", () => {
  beforeEach(() => vi.clearAllMocks());

  it("preserves and echoes a valid request ID", async () => {
    const response = await app.request("/", {
      headers: { "x-request-id": "request-123" }
    });

    expect(response.headers.get("x-request-id")).toBe("request-123");
    expect(requestLogger.set).toHaveBeenCalledWith({ requestId: "request-123" });
  });

  it("replaces an invalid request ID before logging and echoing it", async () => {
    const response = await app.request("/", {
      headers: { "x-request-id": "invalid request id" }
    });

    expect(response.headers.get("x-request-id")).toBe("generated-request-id");
    expect(requestLogger.set).toHaveBeenCalledWith({ requestId: "generated-request-id" });
  });
});
