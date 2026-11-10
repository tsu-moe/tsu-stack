import { Hono } from "hono";
import { describe, expect, it } from "vite-plus/test";

import { type ClientIpVariables } from "#@/shared/lib/client-ip";
import { fixedWindowRateLimit } from "#@/shared/lib/rate-limit";

function createApp() {
  const app = new Hono<{ Variables: ClientIpVariables }>();
  app.use("/*", async (c, next) => {
    c.set("clientIp", c.req.header("x-test-client-ip") ?? "unknown");
    await next();
  });
  app.use("/*", fixedWindowRateLimit({ limit: 2, windowMs: 60_000 }));
  app.get("/", (c) => c.text("ok"));
  return app;
}

describe("fixedWindowRateLimit", () => {
  it("limits each client independently", async () => {
    const app = createApp();
    const headers = { "x-test-client-ip": "192.0.2.1" };

    expect((await app.request("/", { headers })).status).toBe(200);
    const second = await app.request("/", { headers });
    expect(second.status).toBe(200);
    expect(second.headers.get("ratelimit-remaining")).toBe("0");

    const limited = await app.request("/", { headers });
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();

    expect((await app.request("/", { headers: { "x-test-client-ip": "192.0.2.2" } })).status).toBe(200);
  });
});
