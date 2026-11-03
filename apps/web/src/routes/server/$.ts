import { createFileRoute } from "@tanstack/react-router";

import { app } from "@tsu-stack/server";

function forwardToHono(request: Request) {
  // Nitro's Request wrapper needs normalization before Hono rebuilds a streamed body.
  const body = request.body;
  const init: RequestInit & { duplex?: "half" } = {
    headers: request.headers,
    method: request.method,
    signal: request.signal,
    ...(body ? { body, duplex: "half" as const } : {})
  };
  return app.fetch(new Request(request.url, init));
}

export const Route = createFileRoute("/server/$")({
  server: {
    handlers: {
      GET: ({ request }) => forwardToHono(request),

      OPTIONS: ({ request }) => forwardToHono(request),

      POST: ({ request }) => forwardToHono(request)
    }
  }
});
