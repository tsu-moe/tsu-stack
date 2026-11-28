import { ChevronRightIcon } from "lucide-react";

import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
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

export function NavGroup({ items, activeHash }: SidebarNavGroup & { activeHash: string }) {
  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel className="duration-[calc(var(--sidebar-animation-duration)*0.8)] ease-(--sidebar-animation-ease)">
				{label}
			</SidebarGroupLabel> */}

      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            className="group/collapsible"
            defaultOpen={item.hash === activeHash || item.subItems?.some((i) => i.hash === activeHash)}
            key={item.title}
            render={<SidebarMenuItem />}
          >
            {item.subItems?.length ? (
              <>
                <CollapsibleTrigger render={<DashboardMenuButton isActive={item.hash === activeHash} />}>
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
                          isActive={subItem.hash === activeHash}
                          render={
                            <Link
                              to="/dashboard"
                              hash={subItem.hash}
                              activeOptions={{ exact: true, includeHash: true }}
                              aria-label={subItem.title}
                            />
                          }
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
                isActive={item.hash === activeHash}
                render={
                  <Link
                    to="/dashboard"
                    hash={item.hash}
                    activeOptions={{ exact: true, includeHash: true }}
                    aria-label={item.title}
                  />
                }
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
