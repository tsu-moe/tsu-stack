import { ChevronRightIcon } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@tsu-stack/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@tsu-stack/ui/components/sidebar";

import { type SidebarNavGroup } from "@/pages/dashboard/types";

import { DashboardMenuButton } from "./dashboard-menu-button";

export function NavGroup({ items, pathname }: SidebarNavGroup & { pathname?: string }) {
  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel className="duration-[calc(var(--sidebar-animation-duration)*0.8)] ease-(--sidebar-animation-ease)">
				{label}
			</SidebarGroupLabel> */}

      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            className="group/collapsible"
            defaultOpen={item.path === pathname || item.subItems?.some((i) => i.path === pathname)}
            key={item.title}
            render={<SidebarMenuItem />}
          >
            {item.subItems?.length ? (
              <>
                <CollapsibleTrigger render={<DashboardMenuButton isActive={item.path === pathname} />}>
                  {item.icon}
                  <span>{item.title}</span>
                  <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-[height] duration-200">
                  <SidebarMenuSub>
                    {item.subItems?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          className="text-muted-foreground data-active:text-sidebar-accent-foreground!"
                          isActive={subItem.path === pathname}
                          render={<a href={subItem.path} aria-label={subItem.title} />}
                        >
                          {subItem.icon}
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </>
            ) : (
              <DashboardMenuButton
                isActive={item.path === pathname}
                render={<a href={item.path} aria-label={item.title} />}
              >
                {item.icon}
                <span>{item.title}</span>
              </DashboardMenuButton>
            )}
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
