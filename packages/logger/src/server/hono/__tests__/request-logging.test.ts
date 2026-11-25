import { Hono } from "hono";
import { expect, it, vi } from "vite-plus/test";

import { honoLoggerMiddleware, type HonoLogVariables } from "#@/server/hono/middleware";
import { initLogger } from "#@/server/index";

initLogger({ silent: true });

it.each([
  [undefined, "generated-request-id"],
  ["invalid request id", "generated-request-id"],
  ["request-123", "request-123"]
])("uses one request ID when the incoming header is %s", async (incomingId, requestId) => {
  const drain = vi.fn();
  const app = new Hono<HonoLogVariables>();
  app.use("/*", honoLoggerMiddleware({ drain, requestIdOptions: { generator: () => "generated-request-id" } }));
  app.post("/", async (c) => c.text(await c.req.text()));

  const response = await app.request("/", {
    method: "POST",
    headers: incomingId ? { "x-request-id": incomingId } : undefined,
    body: "body preserved"
  });

  expect(await response.text()).toBe("body preserved");
  expect(response.headers.get("x-request-id")).toBe(requestId);
  expect(drain).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      event: expect.objectContaining({ requestId }),
      request: expect.objectContaining({ requestId })
    })
  );
});
