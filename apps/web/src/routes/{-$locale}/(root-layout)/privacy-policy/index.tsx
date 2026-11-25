import { createFileRoute } from "@tanstack/react-router";

import { m } from "@tsu-stack/i18n/messages";

import { generateAppSeo } from "@/shared/lib/seo";

import { PrivacyPolicyPage } from "@/pages/privacy-policy";

import { appConfig } from "@/config/app.config";

export const Route = createFileRoute("/{-$locale}/(root-layout)/privacy-policy/")({
  head: ({ params }) =>
    generateAppSeo({
      alternates: {
        canonicalPath: "/privacy-policy",
        locale: params.locale
      },
      description: m.privacy_policy_page__seo_description({ siteName: appConfig.site.shortName }),
      title: m.privacy_policy_page__seo_title()
    }),
  component: PrivacyPolicyPage
});
