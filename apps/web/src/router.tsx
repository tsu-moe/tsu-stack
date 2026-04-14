import { type ErrorRouteComponent } from "@tanstack/react-router";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { configureLoggerSync } from "@tsu-stack/logger/client";
import { Spinner } from "@tsu-stack/ui/components/spinner";

import { DefaultNotFoundPage } from "@/pages/default-not-found";

import { LoggerProvider } from "@/shared/providers/logger-provider";
import { QueryClientProvider, getQueryClient } from "@/shared/providers/query-client.provider";

import { routeTree } from "@/routeTree.gen";

configureLoggerSync();

export function getRouter() {
  const queryClient = getQueryClient();

  const router = createTanStackRouter({
    /**
     * Don't use defaultErrorComponent and prefer __root's errorComponent
     * in order to prevent nesting with existing layouts
     * @see {@link https://github.com/TanStack/router/issues/1181#issuecomment-2192468966}
     */
    defaultErrorComponent: (({ error }) => {
      throw error;
    }) satisfies ErrorRouteComponent,
    defaultNotFoundComponent: DefaultNotFoundPage,
    defaultPendingComponent: () => (
      <Spinner className="fixed inset-0 -top-(--navbar-height) m-auto flex items-center justify-center" />
    ),
    // Prefetch <Link> on hover and touch
    defaultPreload: "intent",
    // IMPORTANT: Let TanStack Query handle data fetching & caching instead of TanStack Router, default options are found in createQueryClient()
    // https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#passing-all-loader-events-to-an-external-cache
    // This enables Route.loader logic to rerun on every navigation, so when fetching, use queryClient.ensureQueryData() to prevent unnecessary refetches and use cached data when available
    defaultPreloadStaleTime: 0,
    // https://tanstack.com/router/latest/docs/guide/render-optimizations
    defaultStructuralSharing: true,
    // Global initial context defined in __root's RouterAppContext type goes here
    context: { queryClient, user: null },
    routeTree,
    scrollRestoration: true,
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <LoggerProvider>{children}</LoggerProvider>
      </QueryClientProvider>
    ),
  });

  // Required when setting up React Query with SSR, see: https://tanstack.com/router/v1/docs/integrations/query
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    handleRedirects: true,
    // Since we have our own QueryClientProvider implementation, we need to disable the default one from the integration
    wrapQueryClient: false,
  });

  return router;
}

declare module "@tanstack/react-router" {
  // @ts-expect-error - module augmentation to add our custom RouterAppContext to TanStack Router's createRouter generic
  type Register = {
    router: ReturnType<typeof getRouter>;
  };
}
