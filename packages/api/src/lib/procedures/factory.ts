import { openapi } from "@orpc/openapi";
import { ORPCError, os } from "@orpc/server";

import { auth } from "@tsu-stack/auth/index";

import { type OrpcContext } from "#@/lib/context/types";

const o = os.$context<OrpcContext>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session
    }
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth).meta(
  openapi({
    spec: (spec) => {
      return {
        ...spec,
        security: [{ authCookie: [] }]
      };
    }
  })
);

export const freshProtectedProcedure = protectedProcedure.use(
  o.middleware(async ({ context, next }) => {
    const session = await auth.api.getSession({
      headers: context.requestHeaders,
      query: { disableCookieCache: true }
    });

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    return next({ context: { session } });
  })
);
