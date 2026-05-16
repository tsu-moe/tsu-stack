import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

import { LOG_SERVICES, initLogger } from "@tsu-stack/logger/server";
import {
  tanstackStartRequestLoggerMiddleware,
  tanstackStartServerFnLoggerMiddleware
} from "@tsu-stack/logger/server/tanstack-start/middleware";

// We load it in vite.config.ts because they are originally from ENV_WEB_SERVER variables
declare const __BUILD_SOURCE_COMMIT__: string;
declare const __BUILD_NODE_ENV__: string;

initLogger({
  env: {
    environment: __BUILD_NODE_ENV__,
    service: LOG_SERVICES.WEB_SERVER,
    version: __BUILD_SOURCE_COMMIT__
  },
  sampling: {
    keep: [{ status: 400 }, { duration: 1000 }],
    rates: {
      info: 0
    }
  }
});

export const startInstance = createStart(() => {
  return {
    // for Server Functions
    functionMiddleware: [
      tanstackStartServerFnLoggerMiddleware({
        context: {
          environment: __BUILD_NODE_ENV__,
          version: __BUILD_SOURCE_COMMIT__
        }
      })
    ],
    // for API routes
    requestMiddleware: [
      createCsrfMiddleware({
        filter: (ctx) => ctx.handlerType === "serverFn"
      }),
      tanstackStartRequestLoggerMiddleware({
        context: {
          environment: __BUILD_NODE_ENV__,
          version: __BUILD_SOURCE_COMMIT__
        },
        excludePaths: ["**/_api/health/**"]
      })
    ]
  };
});
