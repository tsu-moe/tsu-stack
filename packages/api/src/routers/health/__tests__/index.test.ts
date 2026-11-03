import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { type RouterClient } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { GetMethodCsrfProtectionHandlerPlugin } from "@orpc/server/plugins";
import { describe, expect, it, vi } from "vite-plus/test";

import { createRequestLogger } from "@tsu-stack/logger/server";

import { type OrpcContext } from "#@/lib/context/types";
import { appRouter } from "#@/routers/index";

// Node tests cannot load the Worker's D1 binding; these routes only call health.live.
vi.mock("@tsu-stack/db", () => {
  return { checkIsDbReady: vi.fn() };
});
vi.mock("@tsu-stack/auth/index", () => {
  return { createAuth: vi.fn() };
});

const context: OrpcContext = {
  logger: createRequestLogger({ method: "GET", path: "/server/health/live" }),
  requestHeaders: new Headers(),
  session: null
};

describe("v2 HTTP transport", () => {
  it("keeps the OpenAPI health path under /server", async () => {
    const handler = new OpenAPIHandler(appRouter, {
      plugins: [new GetMethodCsrfProtectionHandlerPlugin()]
    });
    const result = await handler.handle(new Request("http://localhost/server/health/live"), {
      context,
      prefix: "/server"
    });

    expect(result.matched).toBe(true);
    expect(result.response?.status).toBe(200);
    await expect(result.response?.json()).resolves.toMatchObject({ status: "healthy" });
  });

  it("blocks cross-site navigation to an OpenAPI GET route", async () => {
    const handler = new OpenAPIHandler(appRouter, {
      plugins: [new GetMethodCsrfProtectionHandlerPlugin()]
    });
    const result = await handler.handle(
      new Request("http://localhost/server/health/live", {
        headers: { "sec-fetch-mode": "navigate", "sec-fetch-site": "cross-site" }
      }),
      { context, prefix: "/server" }
    );

    expect(result.response?.status).toBe(403);
  });

  it("keeps the RPC path under /server/rpc", async () => {
    const handler = new RPCHandler(appRouter);
    const link = new RPCLink({
      origin: "http://localhost",
      url: "/server/rpc",
      async fetch(url, init) {
        const result = await handler.handle(new Request(url, init), {
          context,
          prefix: "/server/rpc"
        });
        return result.response ?? new Response(null, { status: 404 });
      }
    });
    const client = createORPCClient<RouterClient<typeof appRouter>>(link);

    await expect(client.health.live()).resolves.toMatchObject({ status: "healthy" });
  });
});
