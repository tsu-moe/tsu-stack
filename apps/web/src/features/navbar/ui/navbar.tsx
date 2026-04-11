import { Suspense } from "react";

import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";
import { m } from "@tsu-stack/i18n/messages";
import { type LinkProps } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { useScroll } from "@tsu-stack/ui/hooks/use-scroll.hook";
import { cn } from "@tsu-stack/ui/lib/utils";

import { LocaleSwitcher } from "@/shared/ui/locale-switcher";
import { LogoWordmark } from "@/shared/ui/logo";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";

import { MobileNav } from "./mobile-nav";
import { UserDropdown } from "./user-dropdown";

export type NavbarLink =
  | { label: string; href: LinkProps["href"]; to?: never }
  | { label: string; href?: never; to: LinkProps["to"] };

export const navLinks: NavbarLink[] = [
  {
    label: m.navbar__playground(),
    to: "/playground",
  },
  {
    label: m.navbar__dashboard(),
    to: "/dashboard",
  },
  {
    href: `${ENV_WEB_ISOMORPHIC.VITE_SERVER_URL}/docs`,
    label: m.navbar__api_docs(),
  },
];

export function Navbar() {
  const scrolled = useScroll(10);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent bg-background transition-colors not-dark:shadow not-dark:shadow-transparent",
        {
          "not-dark:shadow-black/10 dark:border-border": scrolled,
        },
      )}
    >
      <nav className="container mx-auto flex h-(--navbar-height) w-full items-center justify-between px-4">
        <Link className="relative -m-2 rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50" to="/">
          <LogoWordmark className="h-6 w-fit" />
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Button asChild key={link.label} size="sm" variant="ghost">
              {link.href ? (
                <a className="hover:text-foreground" target="_blank" href={link.href}>
                  {link.label}
                </a>
              ) : (
                <Link className="hover:text-foreground" to={link.to}>
                  {link.label}
                </Link>
              )}
            </Button>
          ))}
          <LocaleSwitcher />
          <ThemeSwitcher size="icon-sm" />
          <Suspense fallback={null}>
            <UserDropdown />
          </Suspense>
        </div>
        <MobileNav />
      </nav>
    </header>
  );
}
