import { Hono } from "hono";
import { expect, it, vi } from "vite-plus/test";

import { honoLoggerMiddleware, type HonoLogVariables } from "#@/server/hono/middleware";
import { initLogger, REQUEST_LOG_SAMPLING } from "#@/server/index";

const drain = vi.fn();
initLogger({ drain, sampling: REQUEST_LOG_SAMPLING, pretty: false });

it("keeps native audits and serializes bigint without changing the response", async () => {
  const app = new Hono<HonoLogVariables>();
  app.use("/*", honoLoggerMiddleware());
  app.get("/health", (c) => c.body(null, 204));
  app.post("/users", (c) => {
    const logger = c.get("log");
    expect(logger).not.toHaveProperty("emit");
    logger.set({ account: { sequence: 123n }, service: "overridden" });
    logger.audit({
      action: "user.create",
      actor: { type: "user", id: "admin-1" },
      target: { type: "user", id: "user-1" },
      outcome: "success",
      changes: { after: { sequence: 123n } }
    });
    return c.body(null, 201);
  });

  await app.request("/health");
  const response = await app.request("/users", { method: "POST", headers: { "X-Request-Id": "test-request" } });

  expect(response.status).toBe(201);
  expect(drain).toHaveBeenCalledTimes(1);
  expect(drain).toHaveBeenCalledWith(
    expect.objectContaining({
      event: expect.objectContaining({
        requestId: "test-request",
        status: 201,
        account: { sequence: "123" },
        service: "default",
        timestamp: expect.any(String),
        audit: expect.objectContaining({
          action: "user.create",
          actor: { type: "user", id: "admin-1" },
          target: { type: "user", id: "user-1" },
          outcome: "success",
          changes: { after: { sequence: "123" } },
          version: 1,
          idempotencyKey: expect.any(String)
        })
      })
    })
  );
});
