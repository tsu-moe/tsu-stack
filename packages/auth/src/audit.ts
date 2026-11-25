import { type BetterAuthOptions } from "better-auth";

import { resolveRequestId } from "@tsu-stack/logger/request-id";
import { audit } from "@tsu-stack/logger/server";

export const authAuditHooks = {
  user: {
    create: {
      after: async (user, context) => {
        audit({
          action: "user.create",
          actor: { type: "system", id: "better-auth" },
          target: { type: "user", id: user.id },
          outcome: "success",
          ...(context?.request && { correlationId: resolveRequestId(context.request.headers) })
        });
      }
    }
  }
} satisfies NonNullable<BetterAuthOptions["databaseHooks"]>;
