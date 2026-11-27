import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@tsu-stack/ui/components/navigation-menu";
import { cn } from "@tsu-stack/ui/lib/utils";

import { companyLinks, companyLinks2, featuresLinks } from "@/shared/ui/nav-links";
import { DepthBox, LinkItem, NavSmallItem } from "@/shared/ui/sheard";

export function DesktopNav() {
  return (
    <NavigationMenu className={cn("hidden md:block")}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent">Features</NavigationMenuTrigger>
          <NavigationMenuContent>
            <DepthBox className="w-64 gap-2">
              {featuresLinks.map((item, i) => (
                <NavigationMenuLink key={`${item.label}-${i}`} render={<LinkItem {...item} />} />
              ))}
            </DepthBox>
            <div className="p-2">
              <p className="text-xs text-muted-foreground">
                Are you interested?{" "}
                <a className="font-medium text-foreground hover:underline" href="#">
                  Schedule a demo
                </a>
              </p>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent">Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-sm grid-cols-2 gap-2">
              <DepthBox>
                {companyLinks.map((item, i) => (
                  <NavigationMenuLink key={`${item.label}-${i}`} render={<LinkItem {...item} />} />
                ))}
              </DepthBox>
              <div className="p-2 *:mb-1">
                {companyLinks2.map((item, i) => (
                  <NavigationMenuLink key={`${item.label}-${i}`} render={<NavSmallItem {...item} />} />
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuLink className="bg-transparent font-medium" render={<a href="#">Pricing</a>} />
      </NavigationMenuList>
    </NavigationMenu>
  );
}
