import { createFileRoute } from "@tanstack/react-router";

import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${new URL("/sitemap.xml", ENV_WEB_ISOMORPHIC.VITE_WEB_URL).href}
`;

        return new Response(robotsTxt, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        });
      }
    }
  }
});
