import { protectedProcedure } from "#@/lib/procedures/factory";

export const privateRouter = {
  data: protectedProcedure
    .route({
      description: "Test retrieving private data for authenticated users",
      method: "GET",
    })
    .handler(({ context }) => {
      return {
        message: "This is private",
        user: context.session.user,
      };
    }),
};
