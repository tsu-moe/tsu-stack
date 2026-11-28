import { type HTMLAttributes } from "react";

import { cn } from "@tsu-stack/ui/lib/utils";

type SkeletonProps = {
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  animate?: boolean;
} & HTMLAttributes<HTMLDivElement>;

function Skeleton({ className, rounded = "lg", animate = true, ...props }: SkeletonProps) {
  const roundedClass = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full"
  }[rounded];

  return (
    <div
      aria-label="Loading"
      className={cn("relative overflow-hidden bg-muted", roundedClass, className)}
      data-slot="skeleton"
      role="status"
      {...props}
    >
      {animate && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full motion-reduce:hidden"
          style={{
            animation: "shimmer 1.6s ease-in-out infinite",
            background:
              "linear-gradient(90deg, transparent 0%, color-mix(in oklch, var(--foreground) 6%, transparent) 50%, transparent 100%)"
          }}
        />
      )}
      <style>{`@keyframes shimmer { to { transform: translateX(200%); } } @media (prefers-reduced-motion: reduce) { [data-slot=skeleton] > span { display: none !important; } }`}</style>
    </div>
  );
}

export { Skeleton };
export type { SkeletonProps };
