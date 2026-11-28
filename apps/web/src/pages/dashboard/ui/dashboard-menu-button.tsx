import { SidebarMenuButton } from "@tsu-stack/ui/components/sidebar";
import { cn } from "@tsu-stack/ui/lib/utils";

export function DashboardMenuButton({ className, ...props }: React.ComponentProps<typeof SidebarMenuButton>) {
  return (
    <SidebarMenuButton
      className={cn(
        "h-8 px-2 transition-[width]",
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
