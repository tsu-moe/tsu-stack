import handler from "@tanstack/react-start/server-entry";

import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";
import { ENV_WEB_SERVER } from "@tsu-stack/env/web/env.server";
import { paraglideMiddleware } from "@tsu-stack/i18n/server";
import { LOG_SERVICES, REQUEST_LOG_SAMPLING, initLogger } from "@tsu-stack/logger/server";

initLogger({
  env: {
    environment: ENV_WEB_SERVER.NODE_ENV,
    service: LOG_SERVICES.WEB_SERVER,
    version: ENV_WEB_SERVER.SOURCE_COMMIT
  },
  sampling: REQUEST_LOG_SAMPLING
});

export default {
  async fetch(req: Request): Promise<Response> {
    const response = await paraglideMiddleware(req, () => handler.fetch(req));
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    if (ENV_WEB_ISOMORPHIC.VITE_WEB_URL.startsWith("https:")) {
      headers.set("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
    }
    if (headers.get("Content-Type")?.includes("text/html")) {
      headers.set("Cache-Control", "private, no-store");
    }

    return new Response(response.body, {
      headers,
      status: response.status,
      statusText: response.statusText
    });
  }
};
