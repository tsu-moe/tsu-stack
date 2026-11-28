import geistVariableLatin from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import { a11yDevtoolsPlugin } from "@tanstack/devtools-a11y/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Fragment } from "react";

import { resolvePublicAssetUrl } from "@tsu-stack/core/assets";
import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";
import { m } from "@tsu-stack/i18n/messages";
// oxfmt-ignore
import { LocaleProvider, useLocale } from "@tsu-stack/i18n/tanstack-start/components/locale-provider";
import { ToastProvider } from "@tsu-stack/ui/components/toast";
import { TooltipProvider } from "@tsu-stack/ui/components/tooltip";

import { generateAppSeo } from "@/shared/lib/seo";
import { ProgressProvider } from "@/shared/providers/progress.provider";
import appCss from "@/shared/styles/app.css?url";
import { ThemeInitializer, ThemeProvider } from "@/shared/ui/theme-switcher";

import { DefaultErrorPage } from "@/pages/default-error";

// Root route with shared context for the entire app, inject them in router.tsx
type RouterAppContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  errorComponent: DefaultErrorPage,
  shellComponent: RootDocument,
  head: () => {
    const rootSeo = generateAppSeo({
      includeDocumentMeta: true
    });
    const faviconHref = resolvePublicAssetUrl(ENV_WEB_ISOMORPHIC.VITE_WEB_URL, "/favicon.ico");
    const sitemapHref = resolvePublicAssetUrl(ENV_WEB_ISOMORPHIC.VITE_WEB_URL, "/sitemap.xml");

    return {
      links: [
        ...(rootSeo.links ?? []),
        {
          href: faviconHref,
          rel: "icon"
        },
        {
          href: sitemapHref,
          rel: "sitemap",
          type: "application/xml"
        },
        {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: geistVariableLatin,
          crossOrigin: "anonymous"
        },
        { href: appCss, rel: "stylesheet" }
      ],
      meta: [...(rootSeo.meta ?? [])]
    };
  }
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <RootDocumentInner>{children}</RootDocumentInner>
    </LocaleProvider>
  );
}

function RootDocumentInner({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();

  return (
    <html suppressHydrationWarning lang={locale}>
      <head>
        <ThemeInitializer />
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        {/* We place the progress provider here otherwise we will get "Cannot render a <style> outside the main document" error */}
        <ThemeProvider attribute="class" defaultTheme="dark">
          <ProgressProvider>
            <TooltipProvider>
              <ToastProvider closeLabel={m.ui__dismiss_notification()}>
                <Fragment key={locale}>{children}</Fragment>
              </ToastProvider>
            </TooltipProvider>
            <TanStackDevtools
              plugins={[
                {
                  name: "TanStack Query",
                  render: <ReactQueryDevtoolsPanel />
                },
                {
                  name: "TanStack Router",
                  render: <TanStackRouterDevtoolsPanel />
                },
                formDevtoolsPlugin(),
                a11yDevtoolsPlugin()
              ]}
            />
            <Scripts />
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
