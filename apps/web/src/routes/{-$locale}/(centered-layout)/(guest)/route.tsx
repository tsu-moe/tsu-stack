import { noop } from "@tanstack/react-query";
import { Outlet, createFileRoute, type SearchSchemaInput } from "@tanstack/react-router";

import { getAuthUserQueryOptions } from "@tsu-stack/auth/react/tanstack-start/queries";
import { redirect } from "@tsu-stack/i18n/tanstack-start/lib/redirect";
import { validateNavigateTo } from "@tsu-stack/i18n/tanstack-start/lib/validate-navigate-to";

import { AuthLayout } from "@/widgets/auth-layout";

import { routeTree } from "@/routeTree.gen";

export const Route = createFileRoute("/{-$locale}/(centered-layout)/(guest)")({
  validateSearch: ({ redirect: requestedRedirect }: { redirect?: string } & SearchSchemaInput) => {
    const safeRedirect =
      typeof requestedRedirect === "string" &&
      requestedRedirect.startsWith("/") &&
      !requestedRedirect.startsWith("//") &&
      !requestedRedirect.includes("\\")
        ? requestedRedirect
        : undefined;
    return {
      redirect: validateNavigateTo({
        fallbackTo: "/dashboard",
        routeTree,
        shouldIncludeRoute: (route) =>
          !route.id.includes("(guest)") && !route.path.startsWith("/_api") && !route.path.includes("."),
        to: safeRedirect
      })
    };
  },
  component: GuestAuthLayout,
  beforeLoad: async ({ context, search }) => {
    const user = await context.queryClient.query({
      ...getAuthUserQueryOptions(),
      staleTime: "static"
    });
    void context.queryClient.query(getAuthUserQueryOptions()).catch(noop);

    const redirectTo = search.redirect;

    if (user) {
      throw redirect({
        to: redirectTo
      });
    }

    return {
      // We pass this as context so that it can be used in the sign-in/sign-up pages to redirect after successful authentication
      redirectTo
    };
  }
});

function GuestAuthLayout() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
