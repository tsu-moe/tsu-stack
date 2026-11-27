import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@web-components/auth-page";

import { m } from "@tsu-stack/i18n/messages";
import { useNavigate } from "@tsu-stack/i18n/tanstack-start/hooks/use-navigate";

import { generateAppSeo } from "@/shared/lib/seo";

import { appConfig } from "@/config/app.config";

export const Route = createFileRoute("/{-$locale}/(centered-layout)/(guest)/sign-in/")({
  head: ({ params }) =>
    generateAppSeo({
      alternates: {
        canonicalPath: "/sign-in",
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
  const { redirect } = Route.useSearch();

  const navigate = useNavigate();

  return (
    <AuthPage
      onContinueEmail={(email) => {
        void navigate({
          to: "/sign-in/password",
          search: { redirect },
          state: (previous) => {
            return { ...previous, signInEmail: email };
          }
        });
      }}
    />
  );
}
