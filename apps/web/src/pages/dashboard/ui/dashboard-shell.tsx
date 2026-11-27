import { SidebarInset, SidebarProvider } from "@tsu-stack/ui/components/sidebar";
import { cn } from "@tsu-stack/ui/lib/utils";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { SidebarOverlay } from "./sidebar-overlay";

export function DashboardShell({
  children,
  pathname = "#/overview"
}: {
  children: React.ReactNode;
  pathname?: string;
}) {
  return (
    <SidebarProvider
      className={cn(
        "[--sidebar-animation-duration:150ms]",
        "[--sidebar-animation-ease:ease-[cubic-bezier(0.32,0.72,0,1)]]",
        "**:data-[slot=sidebar-gap]:w-(--sidebar-width-icon)",
        "**:data-[slot=sidebar-gap]:duration-(--sidebar-animation-duration) **:data-[slot=sidebar-gap]:ease-(--sidebar-animation-ease)"
      )}
      defaultOpen={false}
    >
      <AppSidebar pathname={pathname} />
      <SidebarInset>
        <AppHeader pathname={pathname} />
        <div className="mx-auto flex w-full max-w-384 flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">{children}</div>
      </SidebarInset>
      <SidebarOverlay />
    </SidebarProvider>
  );
}
