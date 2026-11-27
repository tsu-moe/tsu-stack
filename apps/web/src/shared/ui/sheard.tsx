import { ChevronRightIcon } from "lucide-react";

import { cn } from "@tsu-stack/ui/lib/utils";

import { HomeNavigationLink, type LinkItemType } from "@/shared/ui/nav-links";

export function LinkItem({
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

export function NavSmallItem({
  href,
  icon,
  label,
  className,
  ...props
}: React.ComponentProps<"a"> & Omit<LinkItemType, "description">) {
  return (
    <a className={cn("group relative h-max gap-x-3", className)} href={href} {...props}>
      <div className="[&_svg]:size-4">{icon}</div>
      <p className="text-xs font-medium">{label}</p>
      <div className="relative ml-auto flex h-full w-4 items-center">
        <ChevronRightIcon className="size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
    </a>
  );
}

export function DepthBox({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("relative space-y-2 rounded-2xl border bg-card p-2 shadow-2xs", className)} {...props} />;
}
