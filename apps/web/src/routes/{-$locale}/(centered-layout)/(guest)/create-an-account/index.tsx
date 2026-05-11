import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo } from "@/shared/lib/seo";

import { CreateAnAccountForm } from "@/features/auth";

import { appConfig } from "@/config/app.config";

export const Route = createFileRoute("/{-$locale}/(centered-layout)/(guest)/create-an-account/")({
  head: ({ params }) =>
    generateAppSeo({
      alternates: {
        canonicalPath: "/create-an-account",
        locale: params.locale
      },
      description: `Create a ${appConfig.site.shortName} account to save your progress and access personalized features.`,
      robots: {
        follow: false,
        index: false
      },
      title: "Create an Account"
    }),
  component: RouteComponent
});

function RouteComponent() {
  const { redirect } = Route.useSearch();

  return <CreateAnAccountForm redirectTo={redirect} />;
}
