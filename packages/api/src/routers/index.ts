import { type RouterClient } from "@orpc/server";

import { healthRouter } from "#@/routers/health/index";
import { privateRouter } from "#@/routers/private/index";

export const appRouter = {
  health: healthRouter,
  private: privateRouter
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
