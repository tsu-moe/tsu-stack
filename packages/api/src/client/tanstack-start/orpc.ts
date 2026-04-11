import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createRouterClient, type RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@tsu-stack/auth/index";
import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";
import { getLogger, LOGGER_CATEGORIES_SERVER } from "@tsu-stack/logger/server";

import { appRouter } from "#@/routers/index";

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(appRouter, {
      context: async () => {
        const headers = getRequestHeaders();
        const session = await auth.api.getSession({ headers });
        return {
          logger: getLogger(LOGGER_CATEGORIES_SERVER.SERVER),
          session,
        };
      },
    }),
  )
  .client((): RouterClient<typeof appRouter> => {
    const link = new RPCLink({
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
      url: `${ENV_WEB_ISOMORPHIC.VITE_SERVER_URL}/rpc`,
    });

    return createORPCClient(link);
  });

export const client = getORPCClient();

export const orpc = createTanstackQueryUtils(client);
