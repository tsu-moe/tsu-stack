import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo } from "@/shared/lib/seo";

import { HomePage } from "@/pages/home";

import { appConfig } from "@/config/app.config";

export const Route = createFileRoute("/{-$locale}/(root-layout)/")({
  head: ({ params }) =>
    generateAppSeo({
      alternates: {
        canonicalPath: "/",
        locale: params.locale
      },
      description: appConfig.site.description
    }),
  component: HomePage
});
