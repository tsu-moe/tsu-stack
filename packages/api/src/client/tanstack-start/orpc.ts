import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createRouterClient, type RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { createAuth } from "@tsu-stack/auth/index";
import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";
import { REQUEST_ID_HEADER, resolveRequestId } from "@tsu-stack/logger/request-id";
import { getTanstackStartRequestLogger } from "@tsu-stack/logger/server/tanstack-start/middleware";

import { appRouter } from "#@/routers/index";

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(appRouter, {
      context: async () => {
        const headers = getRequestHeaders();
        const session = await createAuth().api.getSession({ headers });
        return {
          logger: getTanstackStartRequestLogger(),
          requestHeaders: headers,
          session
        };
      }
    })
  )
  .client((): RouterClient<typeof appRouter> => {
    const serverUrl = new URL(ENV_WEB_ISOMORPHIC.VITE_SERVER_URL);
    const link = new RPCLink({
      fetch(url, options) {
        const headers = new Headers(options?.headers);
        headers.set(REQUEST_ID_HEADER, resolveRequestId(headers));
        return fetch(url, {
          ...options,
          credentials: "include",
          headers
        });
      },
      origin: serverUrl.origin,
      url: `${serverUrl.pathname.replace(/\/$/, "")}/rpc` as `/${string}`
    });

    return createORPCClient(link);
  });

export const client = getORPCClient();

export const orpc = createTanstackQueryUtils(client);
