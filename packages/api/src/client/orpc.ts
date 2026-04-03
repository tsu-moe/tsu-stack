import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { type RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import { type AppRouter } from "@tsu-stack/api/routers/index";
import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";

export type { AppRouter } from "@tsu-stack/api/routers/index";

const link = new RPCLink({
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
  url: `${ENV_WEB_ISOMORPHIC.VITE_SERVER_URL}/rpc`,
});

export const client = createORPCClient<RouterClient<AppRouter>>(link);

export const orpc = createTanstackQueryUtils(client);
