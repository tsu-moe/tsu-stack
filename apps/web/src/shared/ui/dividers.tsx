import { cn } from "@tsu-stack/ui/lib/utils";

export function HorizontalDivider({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none relative h-8 w-full", className)} {...props}>
      <div className="absolute inset-y-0.5 -right-7.75 -left-7.75 z-1 bg-background">
        <div className="absolute inset-0 bg-muted/10" />
      </div>

      <div className="absolute inset-x-[-20%] top-px h-px bg-border mask-x-from-96%" />
      <div className="absolute inset-x-[-20%] bottom-px h-px bg-border mask-x-from-96%" />
    </div>
  );
}

export function GridDivider({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-1 grid grid-cols-3",
        "*:pointer-events-none *:border-r *:border-dashed *:border-border/80",
        className
      )}
      {...props}
    >
      <div />
      <div />
    </div>
  );
}
