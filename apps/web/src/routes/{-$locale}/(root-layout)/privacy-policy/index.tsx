import { createFileRoute } from "@tanstack/react-router";

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
      description: `Learn how ${appConfig.site.shortName} collects, uses, and protects your account and usage information.`,
      title: "Privacy Policy"
    }),
  component: PrivacyPolicyPage
});
