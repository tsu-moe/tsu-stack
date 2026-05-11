import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo } from "@/shared/lib/seo";

import { SignInForm } from "@/features/auth";

import { appConfig } from "@/config/app.config";

export const Route = createFileRoute("/{-$locale}/(centered-layout)/(guest)/sign-in/")({
  head: ({ params }) =>
    generateAppSeo({
      alternates: {
        canonicalPath: "/sign-in",
        locale: params.locale
      },
      description: `Sign in to access your ${appConfig.site.shortName} account and manage your saved application data.`,
      robots: {
        follow: false,
        index: false
      },
      title: "Sign In"
    }),
  component: RouteComponent
});

function RouteComponent() {
  const { redirect } = Route.useSearch();

  return <SignInForm redirectTo={redirect} />;
}
