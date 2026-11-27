import { cn } from "@tsu-stack/ui/lib/utils";

import { type LinkItemType } from "@/widgets/site-layout/types";

import { HomeNavigationLink } from "./home-navigation-link";

export function NavLinkItem({
  label,
  description,
  icon,
  className,
  href,
  ...props
}: React.ComponentProps<"a"> & LinkItemType) {
  return (
    <HomeNavigationLink className={cn("flex items-center gap-2", className)} href={href} {...props}>
      {icon && (
        <div className="flex aspect-square size-9 items-center justify-center rounded-2xl border bg-card shadow-xs outline outline-offset-2 outline-border/60 [&_svg]:size-4 [&_svg]:text-foreground">
          {icon}
        </div>
      )}
      <div className="flex flex-col items-start justify-center">
        <span className="text-xs font-medium">{label}</span>
        <span className="line-clamp-1 text-[10px] text-muted-foreground">{description}</span>
      </div>
    </HomeNavigationLink>
  );
}
