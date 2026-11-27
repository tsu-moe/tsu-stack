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

import { m } from "@tsu-stack/i18n/messages";

import { type SidebarNavGroup, type SidebarNavItem } from "@/pages/dashboard/types";

export function getDashboardNavigation() {
  const navGroups: SidebarNavGroup[] = [
    {
      label: m.dashboard_nav__platform(),
      items: [
        {
          title: m.dashboard_nav__overview(),
          path: "#/overview",
          icon: <LayoutGridIcon />
        },
        {
          title: m.dashboard_nav__sales(),
          path: "#/sales",
          icon: <TrendingUpIcon />
        },
        {
          title: m.dashboard_nav__analytics(),
          path: "#/analytics",
          icon: <BarChart3Icon />
        },
        {
          title: m.dashboard_nav__storage(),
          path: "#/storage",
          icon: <DatabaseIcon />
        }
      ]
    },
    {
      label: m.dashboard_nav__store(),
      items: [
        {
          title: m.dashboard_nav__orders(),
          path: "#/orders",
          icon: <ShoppingCartIcon />
        },
        {
          title: m.dashboard_nav__products(),
          path: "#/products",
          icon: <FileTextIcon />
        },
        {
          title: m.dashboard_nav__customers(),
          path: "#/customers",
          icon: <UsersIcon />
        },
        {
          title: m.dashboard_nav__marketing(),
          path: "#/marketing",
          icon: <MegaphoneIcon />
        }
      ]
    },
    {
      label: m.dashboard_nav__developer(),
      items: [
        {
          title: m.dashboard_nav__integrations(),
          path: "#/integrations",
          icon: <PlugIcon />
        },
        {
          title: m.dashboard_nav__activity(),
          path: "#/activity",
          icon: <ActivityIcon />
        },
        {
          title: m.dashboard_nav__logs(),
          path: "#/logs",
          icon: <TerminalIcon />
        }
      ]
    },
    {
      label: m.dashboard_nav__data(),
      items: [
        {
          title: m.dashboard_nav__resources(),
          path: "#/resources",
          icon: <LayersIcon />,
          subItems: [
            {
              title: m.dashboard_nav__compute(),
              path: "#/resources/compute"
            },
            { title: m.dashboard_nav__databases(), path: "#/resources/databases" },
            { title: m.dashboard_nav__queues(), path: "#/resources/queues" },
            { title: m.dashboard_nav__cron_jobs(), path: "#/resources/cron-jobs" },
            { title: m.dashboard_nav__secrets(), path: "#/resources/secrets" }
          ]
        }
      ]
    }
  ];

  const footerNavLinks: SidebarNavItem[] = [
    {
      title: m.dashboard_nav__support(),
      path: "#/support",
      icon: <HelpCircleIcon />
    },
    {
      title: m.dashboard_nav__settings(),
      path: "#/settings",
      icon: <SettingsIcon />
    }
  ];

  return { navGroups, footerNavLinks };
}
