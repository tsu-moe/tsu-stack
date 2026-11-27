import { cn } from "cn";

type KbdProps = React.ComponentProps<"kbd">;
type KbdGroupProps = React.ComponentProps<"kbd">;

const Kbd = ({ className, ...props }: KbdProps) => (
  <kbd
    data-slot="kbd"
    className={cn(
      "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm border border-b-2 border-input bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none [&_svg:not([class*='size-'])]:size-3",
      "in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10",
      className
    )}
    {...props}
  />
);

const KbdGroup = ({ className, ...props }: KbdGroupProps) => (
  <kbd data-slot="kbd-group" className={cn("inline-flex items-center gap-1", className)} {...props} />
);

export { Kbd, KbdGroup };
export type { KbdGroupProps, KbdProps };
