import { Hono } from "hono";
import { expect, it, vi } from "vite-plus/test";

import { honoLoggerMiddleware, type HonoLogVariables } from "#@/server/hono/middleware";
import { initLogger, REQUEST_LOG_SAMPLING } from "#@/server/index";

it("keeps native audit records even when routine request events are sampled out", async () => {
  const drain = vi.fn();
  initLogger({ drain, sampling: REQUEST_LOG_SAMPLING, silent: true });

  const app = new Hono<HonoLogVariables>();
  app.use("/*", honoLoggerMiddleware());
  app.get("/health", (c) => c.body(null, 204));
  app.post("/users", (c) => {
    c.get("log").audit({
      action: "user.create",
      actor: { type: "user", id: "admin-1" },
      target: { type: "user", id: "user-1" },
      outcome: "success"
    });
    return c.body(null, 201);
  });

  await app.request("/health");
  await app.request("/users", { method: "POST", headers: { "X-Request-Id": "test-request" } });

  expect(drain).toHaveBeenCalledTimes(1);
  expect(drain).toHaveBeenCalledWith(
    expect.objectContaining({
      event: expect.objectContaining({
        requestId: "test-request",
        status: 201,
        timestamp: expect.any(String),
        audit: expect.objectContaining({
          action: "user.create",
          actor: { type: "user", id: "admin-1" },
          target: { type: "user", id: "user-1" },
          outcome: "success",
          version: 1,
          idempotencyKey: expect.any(String)
        })
      })
    })
  );
});
