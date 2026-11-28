import { ArrowUpRightIcon } from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";
import { Button } from "@tsu-stack/ui/components/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@tsu-stack/ui/components/navigation-menu";

import { LogoIcon } from "@/shared/assets/brand/logo-icon";

import { getHomeNavigation } from "@/widgets/site-layout/config/nav-links.config";
import { type LinkItemType } from "@/widgets/site-layout/types";

import { HomeNavigationLink } from "./home-navigation-link";

const topLinkClass =
  "h-9 rounded-full bg-transparent px-3 py-0 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus:text-foreground";

export function DesktopNav() {
  const { application, foundations, guides, project, setup, releases, directLinks } = getHomeNavigation();

  return (
    <NavigationMenu align="center" positionMethod="fixed" className="hidden lg:flex">
      <NavigationMenuList className="gap-1">
        <NavigationMenuItem>
          <NavigationMenuTrigger className={topLinkClass} render={<Button radius="full" variant="ghost" />}>
            {m.navbar__stack()}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[35rem] grid-cols-3 gap-2">
              <NavColumn title={m.home_page__nav_app()} items={application} />
              <NavColumn title={m.home_page__nav_foundations()} items={foundations} />
              <NavCallout href={setup.href} title={setup.label} description={setup.description} />
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={topLinkClass} render={<Button radius="full" variant="ghost" />}>
            {m.navbar__resources()}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[35rem] grid-cols-3 gap-2">
              <NavCallout href={releases.href} title={releases.label} description={releases.description} />
              <NavColumn title={m.navbar__guides()} items={guides} />
              <NavColumn title={m.home_page__nav_project()} items={project} />
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {directLinks.map(({ href, label }) => (
          <NavigationMenuItem key={href}>
            <NavigationMenuLink
              className={topLinkClass}
              render={<Button radius="full" variant="ghost" nativeLink render={<a href={href}>{label}</a>} />}
            />
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function NavColumn({ title, items }: { title: string; items: LinkItemType[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <p className="px-2 pt-1 pb-1.5 text-xs font-medium text-muted-foreground">{title}</p>
      {items.map(({ href, icon, label }) => (
        <NavigationMenuLink
          key={label}
          className="min-h-8 gap-2 rounded-lg px-2 py-1 text-sm"
          render={
            <HomeNavigationLink href={href}>
              <span className="shrink-0 text-muted-foreground" aria-hidden="true">
                {icon}
              </span>
              {label}
            </HomeNavigationLink>
          }
        />
      ))}
    </div>
  );
}

function NavCallout({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <NavigationMenuLink
      className="group/callout relative flex min-h-30 items-start justify-between overflow-hidden rounded-xl border bg-card p-3"
      render={
        <HomeNavigationLink href={href}>
          <span className="relative z-10 grid gap-1">
            <span className="font-medium">{title}</span>
            <span className="text-xs leading-relaxed text-muted-foreground">{description}</span>
          </span>
          <ArrowUpRightIcon
            className="relative z-10 shrink-0 text-muted-foreground group-hover/callout:text-foreground"
            aria-hidden="true"
          />
          <LogoIcon
            aria-hidden="true"
            className="pointer-events-none absolute -end-6 -bottom-8 size-28 -rotate-12 opacity-10 grayscale"
          />
        </HomeNavigationLink>
      }
    />
  );
}
