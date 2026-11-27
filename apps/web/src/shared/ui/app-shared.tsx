import {
  LayoutGridIcon,
  TrendingUpIcon,
  BarChart3Icon,
  DatabaseIcon,
  ShoppingCartIcon,
  FileTextIcon,
  UsersIcon,
  MegaphoneIcon,
  PlugIcon,
  ActivityIcon,
  TerminalIcon,
  LayersIcon,
  HelpCircleIcon,
  SettingsIcon
} from "lucide-react";
import { type ReactNode } from "react";

import { SidebarMenuButton } from "@tsu-stack/ui/components/sidebar";
import { cn } from "@tsu-stack/ui/lib/utils";

export type SidebarNavItem = {
  title: string;
  path?: string;
  icon?: ReactNode;
  subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};

export function CustomMenuButton({ className, ...props }: React.ComponentProps<typeof SidebarMenuButton>) {
  return (
    <SidebarMenuButton
      className={cn(
        "[&>span]:text-nowrap [&>span:last-child]:text-clip",
        "[&>span]:transition-opacity [&>span]:duration-(--sidebar-animation-duration) [&>span]:ease-(--sidebar-animation-ease) [&>span]:group-data-[collapsible=icon]:opacity-0",
        "text-muted-foreground data-active:text-sidebar-accent-foreground data-active:[&>span]:font-medium",
        "**:data-[slot=sidebar-menu-sub-button]:text-muted-foreground!",
        "duration-[calc(var(--sidebar-animation-duration)*0.5)] ease-(--sidebar-animation-ease) group-data-[collapsible=icon]:duration-(--sidebar-animation-duration)",
        className
      )}
      {...props}
    />
  );
}

export const navGroups: SidebarNavGroup[] = [
  {
    label: "Platform",
    items: [
      {
        title: "Overview",
        path: "#/overview",
        icon: <LayoutGridIcon />
      },
      {
        title: "Sales",
        path: "#/sales",
        icon: <TrendingUpIcon />
      },
      {
        title: "Analytics",
        path: "#/analytics",
        icon: <BarChart3Icon />
      },
      {
        title: "Storage",
        path: "#/storage",
        icon: <DatabaseIcon />
      }
    ]
  },
  {
    label: "Store",
    items: [
      {
        title: "Orders",
        path: "#/orders",
        icon: <ShoppingCartIcon />
      },
      {
        title: "Products",
        path: "#/products",
        icon: <FileTextIcon />
      },
      {
        title: "Customers",
        path: "#/customers",
        icon: <UsersIcon />
      },
      {
        title: "Marketing",
        path: "#/marketing",
        icon: <MegaphoneIcon />
      }
    ]
  },
  {
    label: "Developer",
    items: [
      {
        title: "Integrations",
        path: "#/integrations",
        icon: <PlugIcon />
      },
      {
        title: "Activity",
        path: "#/activity",
        icon: <ActivityIcon />
      },
      {
        title: "Logs",
        path: "#/logs",
        icon: <TerminalIcon />
      }
    ]
  },
  {
    label: "Data",
    items: [
      {
        title: "Resources",
        path: "#/resources",
        icon: <LayersIcon />,
        subItems: [
          {
            title: "Compute",
            path: "#/resources/compute"
          },
          { title: "Databases", path: "#/resources/databases" },
          { title: "Queues", path: "#/resources/queues" },
          { title: "Cron Jobs", path: "#/resources/cron-jobs" },
          { title: "Secrets", path: "#/resources/secrets" }
        ]
      }
    ]
  }
];

export const footerNavLinks: SidebarNavItem[] = [
  {
    title: "Support",
    path: "#/support",
    icon: <HelpCircleIcon />
  },
  {
    title: "Settings",
    path: "#/settings",
    icon: <SettingsIcon />
  }
];

function navItemsWithDescendants(items: SidebarNavItem[]): SidebarNavItem[] {
  return items.flatMap((item) => (item.subItems?.length ? [item, ...item.subItems] : [item]));
}

export const navLinkItems: SidebarNavItem[] = [
  ...navGroups.flatMap((group) => navItemsWithDescendants(group.items)),
  ...navItemsWithDescendants(footerNavLinks)
];
