"use client";

import { useSidebar } from "@tsu-stack/ui/components/sidebar";
import { cn } from "@tsu-stack/ui/lib/utils";

export function SidebarOverlay({ className, ...props }: React.ComponentProps<"div">) {
  const { open } = useSidebar();

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-40 bg-black/30",
        "data-[state=closed]:opacity-0",
        "transition-opacity duration-(--sidebar-animation-duration) ease-(--sidebar-animation-ease)",
        className
      )}
      data-slot="sidebar-overlay"
      data-state={open ? "open" : "closed"}
      {...props}
    />
  );
}
