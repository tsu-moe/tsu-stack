import { type Context as HonoContext } from "hono";

import { auth } from "@tsu-stack/auth/index";
import { type RequestLogger } from "@tsu-stack/logger/server";

import { type OrpcContext } from "#@/lib/context/types";

export type CreateContextOptions = {
  context: HonoContext;
  logger: RequestLogger;
};

export async function createContext({
  context,
  logger
}: CreateContextOptions): Promise<OrpcContext> {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers
  });
  return {
    logger,
    session
  };
}
