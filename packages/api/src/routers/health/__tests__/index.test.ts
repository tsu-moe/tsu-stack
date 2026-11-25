import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { GetMethodCsrfProtectionHandlerPlugin } from "@orpc/server/plugins";
import { expect, it } from "vite-plus/test";

import { createRequestLogger } from "@tsu-stack/logger/server";

import { appRouter } from "#@/routers/index";

it("blocks cross-site navigation to an OpenAPI GET route", async () => {
  const handler = new OpenAPIHandler(appRouter, { plugins: [new GetMethodCsrfProtectionHandlerPlugin()] });
  const request = new Request("http://localhost/server/health/live", {
    headers: { "sec-fetch-mode": "navigate", "sec-fetch-site": "cross-site" }
  });
  const result = await handler.handle(request, {
    prefix: "/server",
    context: {
      logger: createRequestLogger(),
      requestHeaders: request.headers,
      session: null
    }
  });

  expect(result.response?.status).toBe(403);
});
