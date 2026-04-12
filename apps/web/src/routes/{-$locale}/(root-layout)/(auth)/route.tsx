import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { getAuthUserQueryOptions } from "@tsu-stack/auth/react/tanstack-start/queries";
import { useLocation } from "@tsu-stack/i18n/tanstack-start/hooks/use-location";
import { useNavigate } from "@tsu-stack/i18n/tanstack-start/hooks/use-navigate";
import { getRouteTreePathsLocalized } from "@tsu-stack/i18n/tanstack-start/utils/get-route-tree-paths-localized";
import { redirect } from "@tsu-stack/i18n/tanstack-start/utils/redirect";
import { stripLocalePrefix } from "@tsu-stack/i18n/tanstack-start/utils/strip-locale-prefix";
import { validateNavigateTo } from "@tsu-stack/i18n/tanstack-start/utils/validate-navigate-to";

import { routeTree } from "@/routeTree.gen";

/**
 * Checks if a given pathname is a guest route (sign-in, create-an-account, etc.)
 * We add this because the useEffect may run after the beforeLoad redirect when navigating to a (guest) route
 * which would cause the redirect param to be set to the default since it performs a brand new navigation in /sign-in
 */
function isGuestRoute(pathname: string): boolean {
  const routes = getRouteTreePathsLocalized(routeTree);
  const matchingRoute = routes.find((route) => route.path === pathname);
  return matchingRoute ? matchingRoute.id.includes("(guest)") : false;
}

export const Route = createFileRoute("/{-$locale}/(root-layout)/(auth)")({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData({
      ...getAuthUserQueryOptions(),
      revalidateIfStale: true,
    });

    if (!user) {
      // Strip locale prefix from pathname to avoid duplication
      const cleanPathname = stripLocalePrefix(location.pathname);
      const redirectTo = validateNavigateTo({
        fallbackTo: "/",
        routeTree,
        shouldIncludeRoute: (route) => !route.id.includes("(guest)"),
        to: cleanPathname,
      });

      throw redirect({
        search: {
          redirect: redirectTo,
        },
        to: "/sign-in",
      });
    }

    // Retype the Route context to include a non-null user prop
    return { user };
  },
  component: RequiresAuthLayout,
});

function RequiresAuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useQuery(getAuthUserQueryOptions());
  const { logger } = Route.useRouteContext();

  useEffect(() => {
    if (user === null) {
      if (isGuestRoute(location.pathname)) {
        return;
      }

      const redirectTo = validateNavigateTo({
        fallbackTo: "/",
        routeTree,
        shouldIncludeRoute: (route) => !route.id.includes("(guest)"),
        to: location.pathname,
      });

      void navigate({
        search: {
          redirect: redirectTo,
        },
        to: "/sign-in",
      });
    }
  }, [user, navigate, location.pathname, logger]);

  return <Outlet />;
}
