import { auth } from "@tsu-stack/auth/index";
import { type RequestLogger } from "@tsu-stack/logger/server";

import { type OrpcContext } from "#@/lib/context/types";

export type CreateContextOptions = {
  logger: RequestLogger;
  requestHeaders: Headers;
};

export async function createContext({ logger, requestHeaders }: CreateContextOptions): Promise<OrpcContext> {
  const session = await auth.api.getSession({
    headers: requestHeaders
  });
  return {
    logger,
    requestHeaders,
    session
  };
}
