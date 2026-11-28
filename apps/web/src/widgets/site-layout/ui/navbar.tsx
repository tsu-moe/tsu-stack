"use client";

import { useLocation } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { useScroll } from "@tsu-stack/ui/hooks/use-scroll.hook";
import { cn } from "@tsu-stack/ui/lib/utils";

import { LocaleSwitcher } from "@/shared/ui/locale-switcher";
import { Logo } from "@/shared/ui/logo";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";

import { useNavbarUserQuery } from "@/widgets/site-layout/api/navbar-user.query";

import { appConfig } from "@/config/app.config";

import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

const AccountMenu = lazy(async () => {
  const auth = await import("@/features/auth");
  return { default: auth.AccountMenu };
});

export function Navbar() {
  const scrolled = useScroll(0);
  const { data: user } = useNavbarUserQuery();
  const pathname = useLocation({ select: (location) => location.pathname });

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent bg-background motion-safe:transition-[border-color,box-shadow] lg:bg-background/85 lg:backdrop-blur-xl",
        scrolled && "border-border/70"
      )}
    >
      <div className="home-container flex h-14 items-center justify-between gap-2 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link
          to="/"
          className="inline-flex shrink-0 justify-self-start rounded-sm transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-ring"
          aria-label={m.navbar__home({ siteName: appConfig.site.shortName })}
        >
          <Logo className="h-5 text-base" />
        </Link>
        <DesktopNav />
        <div className="flex items-center justify-end gap-1.5">
          <LocaleSwitcher />
          <ThemeSwitcher size="icon-sm" radius="full" />
          {user ? (
            <Suspense fallback={<span aria-hidden="true" className="size-8 shrink-0" />}>
              <AccountMenu user={user} />
            </Suspense>
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
                className="hidden lg:inline-flex"
                size="sm"
                radius="full"
                nativeLink
                render={<Link to="/sign-in" />}
              >
                {m.navbar__get_started()}
              </Button>
            </>
          )}
          <MobileNav key={pathname} showGuestActions={!user} />
        </div>
      </div>
    </header>
  );
}
