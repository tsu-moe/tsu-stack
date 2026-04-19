import { Outlet, createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import { getAuthUserQueryOptions } from "@tsu-stack/auth/react/tanstack-start/queries";
import { redirect } from "@tsu-stack/i18n/tanstack-start/lib/redirect";
import { validateNavigateTo } from "@tsu-stack/i18n/tanstack-start/lib/validate-navigate-to";
import { type NavigateTo } from "@tsu-stack/i18n/tanstack-start/types";

import { routeTree } from "@/routeTree.gen";

const guestSearchSchema = z.object({
  redirect: z
    .string()
    .optional()
    .catch(undefined)
    .transform(
      (val): NavigateTo =>
        validateNavigateTo({
          fallbackTo: "/",
          routeTree,
          shouldIncludeRoute: (route) => !route.id.includes("(guest)"),
          to: val,
        }),
    ),
});

export const Route = createFileRoute("/{-$locale}/(centered-layout)/(guest)")({
  validateSearch: zodValidator(guestSearchSchema),
  component: Outlet,
  beforeLoad: async ({ context, search }) => {
    const user = await context.queryClient.ensureQueryData({
      ...getAuthUserQueryOptions(),
      revalidateIfStale: true,
    });

    // `redirect` is always NavigateTo (never undefined) thanks to schema transform & i18n path validation util
    const redirectTo = search.redirect;

    if (user) {
      throw redirect({
        to: redirectTo,
      });
    }

    return {
      // We pass this as context so that it can be used in the sign-in/sign-up pages to redirect after successful authentication
      redirectTo,
    };
  },
});
