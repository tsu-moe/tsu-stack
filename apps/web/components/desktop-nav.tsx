import { ArrowUpRightIcon, LayersIcon, PackageIcon } from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@tsu-stack/ui/components/navigation-menu";

import { LogoIcon } from "@/shared/ui/logo";
import { HomeNavigationLink, getHomeNavigation, type LinkItemType, repositoryUrl } from "@/shared/ui/nav-links";

const topLinkClass =
  "h-9 rounded-full bg-transparent px-3 py-0 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus:text-foreground";

export function DesktopNav() {
  const { stack, resources, moreResources } = getHomeNavigation();
  const releasesUrl = `${repositoryUrl}/releases`;

  return (
    <NavigationMenu align="center" className="hidden lg:flex">
      <NavigationMenuList className="gap-1">
        <NavigationMenuItem>
          <NavigationMenuTrigger className={topLinkClass}>{m.navbar__stack()}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[32rem] grid-cols-3 gap-2">
              <NavColumn title={m.home_page__nav_app()} items={stack.slice(0, 2)} />
              <NavColumn title={m.home_page__nav_foundations()} items={stack.slice(2)} />
              <NavCallout
                href="#request-path"
                icon={<LayersIcon aria-hidden="true" />}
                title={m.home_page__workflow_link()}
                description={m.home_page__nav_workflow_description()}
              />
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={topLinkClass}>{m.navbar__resources()}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-96 grid-cols-2 gap-2">
              <NavCallout
                href={releasesUrl}
                icon={<PackageIcon aria-hidden="true" />}
                title={m.navbar__releases()}
                description={m.navbar__releases_description()}
              />
              <NavColumn
                title={m.home_page__nav_project()}
                items={[...resources.filter(({ href }) => href !== releasesUrl), ...moreResources]}
              />
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={topLinkClass} render={<a href={repositoryUrl}>{m.navbar__source()}</a>} />
        </NavigationMenuItem>
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

function NavCallout({
  href,
  title,
  description,
  icon
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <NavigationMenuLink
      className="group/callout relative flex min-h-30 items-start justify-between overflow-hidden rounded-xl border bg-card p-3"
      render={
        <HomeNavigationLink href={href}>
          <span className="relative z-10 grid gap-2">
            <span className="text-info-foreground">{icon}</span>
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
