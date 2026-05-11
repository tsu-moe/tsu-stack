import handler from "@tanstack/react-start/server-entry";

import { ENV_WEB_SERVER } from "@tsu-stack/env/web/env.server";
import { paraglideMiddleware } from "@tsu-stack/i18n/server";
import { LOG_SERVICES, createRequestLogger, initLogger } from "@tsu-stack/logger/server";

initLogger({
  env: {
    environment: ENV_WEB_SERVER.NODE_ENV,
    service: LOG_SERVICES.WEB_SERVER,
    version: ENV_WEB_SERVER.SOURCE_COMMIT
  },
  sampling: {
    keep: [{ status: 400 }, { duration: 1000 }],
    rates: {
      info: 0
    }
  }
});

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const requestLog = createRequestLogger({
      method: req.method,
      path: url.pathname
    });

    try {
      const response = await paraglideMiddleware(req, () => handler.fetch(req));
      requestLog.emit({ status: response.status });
      return response;
    } catch (error) {
      requestLog.error(error instanceof Error ? error : new Error(String(error)));
      requestLog.emit();
      throw error;
    }
  }
};
