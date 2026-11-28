import { createFileRoute } from "@tanstack/react-router";

import { m } from "@tsu-stack/i18n/messages";

import { generateAppSeo } from "@/shared/lib/seo";

import { TermsOfServicePage } from "@/pages/terms-of-service";

import { appConfig } from "@/config/app.config";

export const Route = createFileRoute("/{-$locale}/(root-layout)/(legal-layout)/terms-of-service/")({
  head: ({ params }) =>
    generateAppSeo({
      alternates: {
        canonicalPath: "/terms-of-service",
        locale: params.locale
      },
      description: m.terms_of_service_page__seo_description({ siteName: appConfig.site.shortName }),
      title: m.terms_of_service_page__seo_title()
    }),
  component: TermsOfServicePage
});
