"use client";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { useScroll } from "@tsu-stack/ui/hooks/use-scroll.hook";
import { cn } from "@tsu-stack/ui/lib/utils";

import { Logo } from "@/shared/ui/logo";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";

import { AccountMenu } from "@/features/auth";

import { useNavbarUserQuery } from "@/widgets/site-layout/api/navbar-user.query";

import { appConfig } from "@/config/app.config";

import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

export function Navbar() {
  const scrolled = useScroll(10);
  const { data: user } = useNavbarUserQuery();

  return (
    <header className="sticky top-0 z-50 pt-4 sm:pt-6">
      <div
        className={cn(
          "home-container flex h-14 items-center justify-between gap-2 rounded-full border bg-background/85 px-3 backdrop-blur-md motion-safe:transition-shadow sm:px-4 lg:grid lg:grid-cols-[1fr_auto_1fr]",
          scrolled && "shadow-sm"
        )}
      >
        <Button
          size="sm"
          radius="full"
          variant="ghost"
          nativeLink
          render={<Link to="/" />}
          aria-label={m.navbar__home({ siteName: appConfig.site.shortName })}
        >
          <Logo className="h-5 text-base" />
        </Button>
        <DesktopNav />
        <div className="flex items-center justify-end gap-1.5">
          <ThemeSwitcher size="icon-sm" radius="full" />
          {user ? (
            <AccountMenu user={user} />
          ) : (
            <>
              <Button
                className="hidden lg:inline-flex"
                size="sm"
                radius="full"
                variant="ghost"
                nativeLink
                render={<Link to="/sign-in" />}
              >
                {m.auth__sign_in_link()}
              </Button>
              <Button
                className="hidden sm:inline-flex"
                size="sm"
                radius="full"
                nativeLink
                render={<Link to="/sign-in" />}
              >
                {m.navbar__get_started()}
              </Button>
            </>
          )}
          <MobileNav showGuestActions={!user} />
        </div>
      </div>
    </header>
  );
}
