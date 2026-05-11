import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo } from "@/shared/lib/seo";

import { TermsOfServicePage } from "@/pages/terms-of-service";

import { appConfig } from "@/config/app.config";

export const Route = createFileRoute("/{-$locale}/(root-layout)/terms-of-service/")({
  head: ({ params }) =>
    generateAppSeo({
      alternates: {
        canonicalPath: "/terms-of-service",
        locale: params.locale
      },
      description: `Review the rules, responsibilities, and terms for using ${appConfig.site.shortName}.`,
      title: "Terms of Service"
    }),
  component: TermsOfServicePage
});
