import { createFileRoute } from "@tanstack/react-router";

import { m } from "@tsu-stack/i18n/messages";

import { generateAppSeo } from "@/shared/lib/seo";

import { CreateAnAccountForm } from "@/features/auth";

import { CenteredLayout } from "@/widgets/layouts";

import { appConfig } from "@/config/app.config";

export const Route = createFileRoute("/{-$locale}/(centered-layout)/(guest)/create-an-account/")({
  head: ({ params }) =>
    generateAppSeo({
      alternates: {
        canonicalPath: "/create-an-account",
        locale: params.locale
      },
      description: m.auth__create_account__seo_description({ siteName: appConfig.site.shortName }),
      robots: {
        follow: false,
        index: false
      },
      title: m.auth__create_account__seo_title()
    }),
  component: RouteComponent
});

function RouteComponent() {
  const { redirect } = Route.useSearch();

  return (
    <CenteredLayout>
      <CreateAnAccountForm redirectTo={redirect} />
    </CenteredLayout>
  );
}
