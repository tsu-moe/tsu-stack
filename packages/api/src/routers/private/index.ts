import { openapi } from "@orpc/openapi";
import { z } from "zod";

import { protectedProcedure } from "#@/lib/procedures/factory";

export const privateRouter = {
  data: protectedProcedure
    .meta(
      openapi({
        description: "Test retrieving private data for authenticated users",
        method: "GET"
      })
    )
    .output(
      z.strictObject({
        message: z.string(),
        user: z.strictObject({
          id: z.string(),
          name: z.string()
        })
      })
    )
    .handler(({ context }) => {
      const { id, name } = context.session.user;
      return {
        message: "This is private",
        user: { id, name }
      };
    })
};
