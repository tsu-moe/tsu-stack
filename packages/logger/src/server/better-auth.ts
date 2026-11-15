import { identifyUser } from "evlog/better-auth";

import { type RequestLogger } from "#@/server/index";

type BetterAuthSession = Parameters<typeof identifyUser>[1];

/** Add the authenticated user ID to an existing request event without session or profile data. */
export function identifyRequestUser(logger: RequestLogger, session: BetterAuthSession) {
  return identifyUser(logger, session, {
    fields: ["id"],
    session: false
  });
}
