import { TanStackDevtools } from "@tanstack/react-devtools";
import { type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { type orpc } from "@tsu-stack/api/client/orpc";
import { type AuthQueryResult } from "@tsu-stack/auth/react/tanstack-start/queries";
import { getAuthQueryOptions } from "@tsu-stack/auth/react/tanstack-start/queries";
import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";
import { getLocale } from "@tsu-stack/i18n/runtime";
import { type getLogger } from "@tsu-stack/logger/client";
import { Toaster } from "@tsu-stack/ui/components/sonner";

import { ThemeProvider } from "@/features/theme-switcher";
import { DefaultErrorPage } from "@/pages/default-error";
import { appConfig } from "@/shared/config/app.config";
import { ProgressProvider } from "@/shared/providers/progress.provider";

import appCss from "@/shared/styles/app.css?url";

// Root route with shared context for the entire app, inject them in router.tsx
type RouterAppContext = {
  orpc: typeof orpc;
  queryClient: QueryClient;
  logger: ReturnType<typeof getLogger>;
  user: AuthQueryResult;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  errorComponent: DefaultErrorPage,
  shellComponent: RootDocument,
  // Consider removing this if you don't need the auth state everywhere
  // An example of when to KEEP it is when you conditionally display a sign-up button in the header based on the auth state
  beforeLoad: ({ context, preload }) => {
    // Don't prefetch during preload to prevent spamming the server with getSession requests
    if (!preload) {
      // Prefetch (don't await) the user data on app load to have it ready for any route that needs it, and to set the auth state early
      // oxlint-disable-next-line typescript-eslint(no-floating-promises)
      context.queryClient.prefetchQuery(getAuthQueryOptions());
    }
  },
  head: () => {
    return {
      links: [
        {
          href: `${ENV_WEB_ISOMORPHIC.VITE_WEB_URL}/favicon.ico`,
          rel: "icon",
        },
        {
          href: `${ENV_WEB_ISOMORPHIC.VITE_WEB_URL}/sitemap.xml`,
          rel: "sitemap",
          type: "application/xml",
        },
        {
          href: `${ENV_WEB_ISOMORPHIC.VITE_WEB_URL}`,
          rel: "canonical",
        },
        { href: appCss, rel: "stylesheet" },
      ],
      meta: [
        {
          title: appConfig.site.longName,
        },
        {
          charSet: "utf-8",
        },
        {
          content: "width=device-width, initial-scale=1",
          name: "viewport",
        },
        { content: appConfig.site.description, name: "description" },
        // Open Graph
        { content: appConfig.site.longName, property: "og:title" },
        { content: appConfig.site.description, property: "og:description" },
        {
          content: `${ENV_WEB_ISOMORPHIC.VITE_WEB_URL}/og/index.png`,
          property: "og:image",
        },
        { content: "website", property: "og:type" },
        { content: `${ENV_WEB_ISOMORPHIC.VITE_WEB_URL}/logo512.png`, property: "og:logo" },
        // Twitter Card
        { content: "summary_large_image", name: "twitter:card" },
        { content: appConfig.site.shortName, name: "twitter:title" },
        { content: appConfig.site.description, name: "twitter:description" },
        {
          content: `${ENV_WEB_ISOMORPHIC.VITE_WEB_URL}/og/index.png`,
          name: "twitter:image",
        },
        // Resource hints for performance
        { content: "on", httpEquiv: "x-dns-prefetch-control" },
      ],
    };
  },
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang={getLocale()}>
      <head>
        <HeadContent />
      </head>
      <body>
        {/* We place the progress provider here otherwise we will get "Cannot render a <style> outside the main document" error */}
        <ThemeProvider attribute="class" defaultTheme="dark">
          <ProgressProvider>
            {children}
            <Toaster richColors />
            <TanStackDevtools
              plugins={[
                {
                  name: "TanStack Query",
                  render: <ReactQueryDevtoolsPanel />,
                },
                {
                  name: "TanStack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
            <Scripts />
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
