import { Outlet, createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { appConfig } from "@/config/app.config";

export const Route = createFileRoute("/{-$locale}")({
  beforeLoad: ({ params, location }) => {
    const availableLocales = appConfig.i18n.locales;
    // catches invalid locales like /custom-app-path/not-found-locale/i18n
    if (
      params.locale &&
      !availableLocales.includes(params.locale as (typeof availableLocales)[0])
    ) {
      throw notFound();
    }

    if (params.locale === appConfig.i18n.baseLocale) {
      throw redirect({
        to: location.href.replace(`/${params.locale}`, "/"),
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
