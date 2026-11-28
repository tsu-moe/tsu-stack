import { Hono } from "hono";
import { beforeEach, expect, it, vi } from "vite-plus/test";

import { honoLoggerMiddleware, type HonoLogVariables } from "#@/server/hono/middleware";
import { createLogger, initLogger, REQUEST_LOG_SAMPLING } from "#@/server/index";

const drain = vi.fn();
initLogger({ drain, sampling: REQUEST_LOG_SAMPLING, pretty: false });
beforeEach(() => drain.mockClear());

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

it("redacts exception text and causes in standalone and Hono events", async () => {
  const privateText = "synthetic private diagnostic";
  const error = new TypeError(privateText, { cause: new Error(privateText) });
  const logger = createLogger({ operation: "user.sync" });
  logger.error(error);
  const event = logger.emit();
  expect(event).toMatchObject({ level: "error", operation: "user.sync", error: { name: "TypeError" } });
  expect(JSON.stringify(event)).not.toContain(privateText);

  const app = new Hono<HonoLogVariables>();
  app.use("/*", honoLoggerMiddleware());
  app.onError((_error, c) => c.body(null, 500));
  app.get("/failure", () => {
    throw error;
  });
  expect((await app.request("/failure")).status).toBe(500);
  expect(drain).toHaveBeenCalledTimes(2);
  expect(drain).toHaveBeenLastCalledWith(
    expect.objectContaining({
      event: expect.objectContaining({
        level: "error",
        path: "/failure",
        status: 500,
        error: expect.objectContaining({ name: "TypeError" })
      })
    })
  );
  expect(JSON.stringify(drain.mock.calls)).not.toContain(privateText);
});
