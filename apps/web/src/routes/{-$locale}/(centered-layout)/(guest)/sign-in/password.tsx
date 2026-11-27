import { useLocation } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

import { m } from "@tsu-stack/i18n/messages";

import { generateAppSeo } from "@/shared/lib/seo";

import { SignInForm } from "@/features/auth";

import { CenteredLayout } from "@/widgets/layouts";

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
  const { redirect } = Route.useSearch();

  const state = useLocation({ select: (location) => location.state });
  const email = "signInEmail" in state && typeof state.signInEmail === "string" ? state.signInEmail : "";

  return (
    <CenteredLayout>
      <SignInForm initialEmail={email} redirectTo={redirect} />
    </CenteredLayout>
  );
}
