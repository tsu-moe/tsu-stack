import { createFileRoute } from "@tanstack/react-router";

import { m } from "@tsu-stack/i18n/messages";

import { generateAppSeo } from "@/shared/lib/seo";

import { HomePage } from "@/pages/home";

export const Route = createFileRoute("/{-$locale}/(root-layout)/")({
  head: ({ params }) =>
    generateAppSeo({
      alternates: {
        canonicalPath: "/",
        locale: params.locale
      },
      description: m.home_page__hero_description()
    }),
  component: HomePage
});
