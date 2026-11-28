import { createAuth } from "@tsu-stack/auth/index";
import { type RequestLogger } from "@tsu-stack/logger/server";

import { type OrpcContext } from "#@/lib/context/types";

export type CreateContextOptions = {
  logger: RequestLogger;
  requestHeaders: Headers;
  resolveSession?: boolean;
};

export async function createContext({
  logger,
  requestHeaders,
  resolveSession = true
}: CreateContextOptions): Promise<OrpcContext> {
  const session = resolveSession ? await createAuth().api.getSession({ headers: requestHeaders }) : null;
  return {
    logger,
    requestHeaders,
    session
  };
}
