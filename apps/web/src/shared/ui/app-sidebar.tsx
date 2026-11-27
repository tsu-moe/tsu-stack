"use client";

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

import { CustomMenuButton, footerNavLinks, navGroups } from "@/shared/ui/app-shared";
import { LogoIcon } from "@/shared/ui/logo";
import { NavGroup } from "@/shared/ui/nav-group";

export function AppSidebar({ pathname }: { pathname?: string }) {
  const { setOpen } = useSidebar();
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
    >
      <SidebarHeader className="h-14 justify-center border-b">
        <CustomMenuButton className="text-foreground" render={<a href="#link" aria-label="Efferd" />}>
          <LogoIcon />
          <span className="font-medium">Efferd</span>
        </CustomMenuButton>
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
              <CustomMenuButton
                className="text-xs text-muted-foreground [&>svg]:size-3.5"
                isActive={item.path === pathname}
                render={<a href={item.path} aria-label={item.title} />}
              >
                {item.icon}
                <span>{item.title}</span>
              </CustomMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
