"use client";

import { useAuth } from "@tsu-stack/auth/react/tanstack-start/hooks";
import { m } from "@tsu-stack/i18n/messages";
import { Separator } from "@tsu-stack/ui/components/separator";
import { SidebarTrigger } from "@tsu-stack/ui/components/sidebar";
import { cn } from "@tsu-stack/ui/lib/utils";

import { AppBreadcrumbs } from "@/shared/ui/app-breadcrumbs";
import { AppSearch } from "@/shared/ui/app-search";
import { getDashboardNavigation } from "@/shared/ui/app-shared";
import { NavUser } from "@/shared/ui/nav-user";
import { NotificationsPopover } from "@/shared/ui/notifications-popover";

export function AppHeader({ pathname, onSignOut }: { pathname?: string; onSignOut?: () => void }) {
  const { user } = useAuth();
  const { navGroups, footerNavLinks } = getDashboardNavigation();
  const items = [...navGroups.flatMap((group) => group.items), ...footerNavLinks];
  const activeItem = items.flatMap((item) => [item, ...(item.subItems ?? [])]).find((item) => item.path === pathname);
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
        {user && <NavUser user={user} onSignOut={onSignOut} />}
      </div>
    </header>
  );
}
