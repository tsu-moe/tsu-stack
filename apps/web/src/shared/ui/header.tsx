"use client";

import { DesktopNav } from "@web-components/desktop-nav";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { useScroll } from "@tsu-stack/ui/hooks/use-scroll";
import { cn } from "@tsu-stack/ui/lib/utils";

import { Logo } from "@/shared/ui/logo";
import { MobileNav } from "@/shared/ui/mobile-nav";

import { appConfig } from "@/config/app.config";

export function Header() {
  const scrolled = useScroll(10);

  return (
    <header
      className={cn("sticky top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent", {
        "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50": scrolled
      })}
    >
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link
            className="rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50"
            to="/"
            aria-label={m.navbar__home({ siteName: appConfig.site.shortName })}
          >
            <Logo className="h-4" />
          </Link>
          <div className="hidden h-5 w-px bg-border md:block" />
          <DesktopNav />
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button size="sm" variant="outline" render={<Link to="/sign-in" />} nativeButton={false}>
            {m.auth__sign_in_link()}
          </Button>
          <Button size="sm" render={<Link to="/sign-in" />} nativeButton={false}>
            {m.navbar__get_started()}
          </Button>
        </div>
        <MobileNav />
      </nav>
    </header>
  );
}
