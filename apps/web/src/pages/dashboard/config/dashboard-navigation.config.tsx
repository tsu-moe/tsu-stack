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
          hash: "/overview",
          icon: <LayoutGridIcon />
        },
        {
          title: m.dashboard_nav__sales(),
          hash: "/sales",
          icon: <TrendingUpIcon />
        },
        {
          title: m.dashboard_nav__analytics(),
          hash: "/analytics",
          icon: <BarChart3Icon />
        },
        {
          title: m.dashboard_nav__storage(),
          hash: "/storage",
          icon: <DatabaseIcon />
        }
      ]
    },
    {
      label: m.dashboard_nav__store(),
      items: [
        {
          title: m.dashboard_nav__orders(),
          hash: "/orders",
          icon: <ShoppingCartIcon />
        },
        {
          title: m.dashboard_nav__products(),
          hash: "/products",
          icon: <FileTextIcon />
        },
        {
          title: m.dashboard_nav__customers(),
          hash: "/customers",
          icon: <UsersIcon />
        },
        {
          title: m.dashboard_nav__marketing(),
          hash: "/marketing",
          icon: <MegaphoneIcon />
        }
      ]
    },
    {
      label: m.dashboard_nav__developer(),
      items: [
        {
          title: m.dashboard_nav__integrations(),
          hash: "/integrations",
          icon: <PlugIcon />
        },
        {
          title: m.dashboard_nav__activity(),
          hash: "/activity",
          icon: <ActivityIcon />
        },
        {
          title: m.dashboard_nav__logs(),
          hash: "/logs",
          icon: <TerminalIcon />
        }
      ]
    },
    {
      label: m.dashboard_nav__data(),
      items: [
        {
          title: m.dashboard_nav__resources(),
          hash: "/resources",
          icon: <LayersIcon />,
          subItems: [
            {
              title: m.dashboard_nav__compute(),
              hash: "/resources/compute"
            },
            { title: m.dashboard_nav__databases(), hash: "/resources/databases" },
            { title: m.dashboard_nav__queues(), hash: "/resources/queues" },
            { title: m.dashboard_nav__cron_jobs(), hash: "/resources/cron-jobs" },
            { title: m.dashboard_nav__secrets(), hash: "/resources/secrets" }
          ]
        }
      ]
    }
  ];

  const footerNavLinks: SidebarNavItem[] = [
    {
      title: m.dashboard_nav__support(),
      hash: "/support",
      icon: <HelpCircleIcon />
    },
    {
      title: m.dashboard_nav__settings(),
      hash: "/settings",
      icon: <SettingsIcon />
    }
  ];

  return { navGroups, footerNavLinks };
}
