"use client";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar
} from "@tsu-stack/ui/components/sidebar";
import { cn } from "@tsu-stack/ui/lib/utils";

import { LogoIcon } from "@/shared/assets/brand/logo-icon";

import { getDashboardNavigation } from "@/pages/dashboard/config/dashboard-navigation.config";

import { appConfig } from "@/config/app.config";

import { DashboardMenuButton } from "./dashboard-menu-button";
import { NavGroup } from "./nav-group";

export function AppSidebar({ pathname }: { pathname?: string }) {
  const { setOpen } = useSidebar();
  const { footerNavLinks, navGroups } = getDashboardNavigation();
  return (
    <Sidebar
      className={cn(
        "z-50 border-r",
        "*:data-[slot=sidebar-inner]:bg-background",
        "duration-(--sidebar-animation-duration) ease-(--sidebar-animation-ease)"
      )}
      collapsible="icon"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      variant="sidebar"
      mobileTitle={m.dashboard_page__navigation_label()}
      mobileDescription={m.dashboard_page__navigation_description()}
    >
      <SidebarHeader className="h-14 justify-center border-b">
        <DashboardMenuButton
          className="text-foreground"
          render={<Link to="/" aria-label={m.navbar__home({ siteName: appConfig.site.shortName })} />}
        >
          <LogoIcon />
          <span className="font-medium">{appConfig.site.shortName}</span>
        </DashboardMenuButton>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group, index) => (
          <NavGroup key={`sidebar-group-${index}`} {...group} pathname={pathname} />
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          {footerNavLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <DashboardMenuButton
                className="text-xs text-muted-foreground [&>svg]:size-3.5"
                isActive={item.path === pathname}
                render={<a href={item.path} aria-label={item.title} />}
              >
                {item.icon}
                <span>{item.title}</span>
              </DashboardMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
