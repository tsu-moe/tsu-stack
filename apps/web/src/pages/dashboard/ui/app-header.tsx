"use client";

import { useAuth } from "@tsu-stack/auth/react/tanstack-start/hooks";
import { m } from "@tsu-stack/i18n/messages";
import { Separator } from "@tsu-stack/ui/components/separator";
import { SidebarTrigger } from "@tsu-stack/ui/components/sidebar";
import { cn } from "@tsu-stack/ui/lib/utils";

import { AccountMenu } from "@/features/auth";

import { getDashboardNavigation } from "@/pages/dashboard/config/dashboard-navigation.config";

import { AppBreadcrumbs } from "./app-breadcrumbs";
import { AppSearch } from "./app-search";
import { NotificationsPopover } from "./notifications-popover";

export function AppHeader({ activeHash }: { activeHash: string }) {
  const { user } = useAuth();
  const { navGroups, footerNavLinks } = getDashboardNavigation();
  const items = [...navGroups.flatMap((group) => group.items), ...footerNavLinks];
  const activeItem = items.flatMap((item) => [item, ...(item.subItems ?? [])]).find((item) => item.hash === activeHash);
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 md:px-6",
        "bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50"
      )}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger aria-label={m.dashboard_page__toggle_sidebar()} className="md:hidden" />
        <Separator className="mr-2 h-4 data-[orientation=vertical]:self-center md:hidden" orientation="vertical" />
        <AppBreadcrumbs page={activeItem} />
      </div>
      <div className="flex items-center gap-3">
        <AppSearch />
        <NotificationsPopover />
        <Separator className="h-4 data-[orientation=vertical]:self-center" orientation="vertical" />
        {user && <AccountMenu user={user} />}
      </div>
    </header>
  );
}
