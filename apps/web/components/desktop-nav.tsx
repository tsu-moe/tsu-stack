import { m } from "@tsu-stack/i18n/messages";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@tsu-stack/ui/components/navigation-menu";
import { cn } from "@tsu-stack/ui/lib/utils";

import { getHomeNavigation, repositoryUrl } from "@/shared/ui/nav-links";
import { DepthBox, LinkItem, NavSmallItem } from "@/shared/ui/sheard";

export function DesktopNav() {
  const { stack, resources, moreResources } = getHomeNavigation();

  return (
    <NavigationMenu className={cn("hidden md:block")}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent">{m.navbar__stack()}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <DepthBox className="w-64 gap-2">
              {stack.map((item, i) => (
                <NavigationMenuLink key={`${item.label}-${i}`} render={<LinkItem {...item} />} />
              ))}
            </DepthBox>
            <div className="p-2">
              <p className="text-xs text-muted-foreground">
                {m.navbar__source_prompt()}{" "}
                <a className="font-medium text-foreground hover:underline" href={repositoryUrl}>
                  {m.home_page__hero_cta()}
                </a>
              </p>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent">{m.navbar__resources()}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-sm grid-cols-2 gap-2">
              <DepthBox>
                {resources.map((item, i) => (
                  <NavigationMenuLink key={`${item.label}-${i}`} render={<LinkItem {...item} />} />
                ))}
              </DepthBox>
              <div className="p-2 *:mb-1">
                {moreResources.map((item, i) => (
                  <NavigationMenuLink key={`${item.label}-${i}`} render={<NavSmallItem {...item} />} />
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuLink
          className="bg-transparent font-medium"
          render={<a href={repositoryUrl}>{m.navbar__source()}</a>}
        />
      </NavigationMenuList>
    </NavigationMenu>
  );
}
