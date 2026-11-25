import { createFileRoute } from "@tanstack/react-router";

import { m } from "@tsu-stack/i18n/messages";

import { generateAppSeo } from "@/shared/lib/seo";

import { PlaygroundPage } from "@/pages/playground";

import { appConfig } from "@/config/app.config";

export const Route = createFileRoute("/{-$locale}/(root-layout)/playground/")({
  head: ({ params }) =>
    generateAppSeo({
      alternates: {
        canonicalPath: "/playground",
        locale: params.locale
      },
      description: m.playground_page__seo_description({ siteName: appConfig.site.shortName }),
      robots: {
        follow: false,
        index: false
      },
      title: m.playground_page__seo_title()
    }),
  component: PlaygroundPage
});
