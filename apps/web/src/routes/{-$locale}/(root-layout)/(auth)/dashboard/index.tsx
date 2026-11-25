import { createFileRoute } from "@tanstack/react-router";

import { m } from "@tsu-stack/i18n/messages";

import { generateAppSeo } from "@/shared/lib/seo";

import { DashboardPage } from "@/pages/dashboard";

import { appConfig } from "@/config/app.config";

export const Route = createFileRoute("/{-$locale}/(root-layout)/(auth)/dashboard/")({
  head: ({ params }) =>
    generateAppSeo({
      alternates: {
        canonicalPath: "/dashboard",
        locale: params.locale
      },
      description: m.dashboard_page__seo_description({ siteName: appConfig.site.shortName }),
      robots: {
        follow: false,
        index: false
      },
      title: m.dashboard_page__seo_title()
    }),
  component: DashboardPage
});
