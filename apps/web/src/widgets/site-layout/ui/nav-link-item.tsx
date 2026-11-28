import { cn } from "@tsu-stack/ui/lib/utils";

import { type LinkItemType } from "@/widgets/site-layout/types";

import { HomeNavigationLink } from "./home-navigation-link";

export function NavLinkItem({
  label,
  icon,
  className,
  href,
  ...props
}: React.ComponentProps<"a"> & Pick<LinkItemType, "href" | "icon" | "label">) {
  return (
    <HomeNavigationLink
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring active:bg-accent",
        className
      )}
      href={href}
      {...props}
    >
      {icon && (
        <span aria-hidden="true" className="flex shrink-0 items-center text-primary/80 [&_svg]:size-3.5">
          {icon}
        </span>
      )}
      {label}
    </HomeNavigationLink>
  );
}
