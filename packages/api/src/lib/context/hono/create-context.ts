import { type Context as HonoContext } from "hono";

import { auth } from "@tsu-stack/auth/index";
import { type RequestLogger } from "@tsu-stack/logger/server";

import { type OrpcContext } from "#@/lib/context/types";

export type CreateContextOptions = {
  context: HonoContext;
  logger: RequestLogger;
  resolveSession?: boolean;
};

export async function createContext({
  context,
  logger,
  resolveSession = true
}: CreateContextOptions): Promise<OrpcContext> {
  const requestHeaders = context.req.raw.headers;
  const session = resolveSession ? await auth.api.getSession({ headers: requestHeaders }) : null;
  return {
    logger,
    requestHeaders,
    session
  };
}
