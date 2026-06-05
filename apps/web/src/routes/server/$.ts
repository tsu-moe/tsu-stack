import { createFileRoute } from "@tanstack/react-router";

import { app } from "@tsu-stack/server";

export const Route = createFileRoute("/server/$")({
  server: {
    handlers: {
      GET: ({ request }) => app.fetch(request),

      POST: ({ request }) => app.fetch(request)
    }
  }
});
