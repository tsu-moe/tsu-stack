import { type ReactNode } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";

import { DashboardPreview } from "@/shared/ui/dashboard-preview";
import { Logo } from "@/shared/ui/logo";

import { appConfig } from "@/config/app.config";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-2">
      <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-6 p-6 sm:p-8 lg:p-10">
        <Link
          aria-label={m.navbar__home({ siteName: appConfig.site.shortName })}
          className="inline-flex justify-self-start rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
          to="/"
        >
          <Logo className="h-5 text-base" />
        </Link>
        <div className="mx-auto flex w-full max-w-xs flex-col justify-center">{children}</div>
        <footer className="mx-auto max-w-sm">
          <p className="text-center text-xs text-muted-foreground">
            {m.auth__terms_agreement()}{" "}
            <Link className="underline underline-offset-4 hover:text-primary" to="/terms-of-service">
              {m.auth__terms_of_service()}
            </Link>{" "}
            {m.auth__and()}{" "}
            <Link className="underline underline-offset-4 hover:text-primary" to="/privacy-policy">
              {m.auth__privacy_policy()}
            </Link>
            {m.auth__terms_agreement_end()}
          </p>
        </footer>
      </div>
      <div
        aria-hidden="true"
        className="home-color-panel my-3 me-3 hidden min-w-0 items-center overflow-hidden rounded-3xl ps-16 lg:flex xl:ps-26"
      >
        <DashboardPreview alt="" className="w-[max(100%,min(80vw,135dvh))] shrink-0" />
      </div>
    </main>
  );
}
