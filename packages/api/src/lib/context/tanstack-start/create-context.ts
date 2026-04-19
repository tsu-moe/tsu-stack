import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@tsu-stack/auth/index";
import { type getLogger } from "@tsu-stack/logger/server";

import { type OrpcContext } from "#@/lib/context/types";

export type CreateContextOptions = {
  logger: ReturnType<typeof getLogger>;
};

export async function createContext({ logger }: CreateContextOptions): Promise<OrpcContext> {
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  });

  return {
    logger,
    session,
  };
}
