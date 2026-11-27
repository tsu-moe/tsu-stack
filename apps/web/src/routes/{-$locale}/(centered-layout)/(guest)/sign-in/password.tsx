import { createFileRoute } from "@tanstack/react-router";

import { m } from "@tsu-stack/i18n/messages";

import { generateAppSeo } from "@/shared/lib/seo";

import { SignInForm } from "@/features/auth";

import { appConfig } from "@/config/app.config";

export const Route = createFileRoute("/{-$locale}/(centered-layout)/(guest)/sign-in/password")({
  head: ({ params }) =>
    generateAppSeo({
      alternates: {
        canonicalPath: "/sign-in/password",
        locale: params.locale
      },
      description: m.auth__sign_in__seo_description({ siteName: appConfig.site.shortName }),
      robots: {
        follow: false,
        index: false
      },
      title: m.auth__sign_in__seo_title()
    }),
  component: RouteComponent
});

function RouteComponent() {
  const { redirectTo } = Route.useRouteContext();
  return <SignInForm redirectTo={redirectTo} />;
}
