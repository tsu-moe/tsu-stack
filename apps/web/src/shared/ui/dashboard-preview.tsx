import { Card, CardContent } from "@tsu-stack/ui/components/card";
import { cn } from "@tsu-stack/ui/lib/utils";

import { dashboardPreviews } from "@/shared/assets/dashboard-preview";

export function DashboardPreview({
  alt,
  className,
  priority = false,
  sizes
}: {
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Card variant="inset" className={cn("border-none bg-background/15 p-2 shadow-xl dark:bg-white/8", className)}>
      <CardContent className="aspect-video overflow-hidden p-0">
        <img
          alt={alt}
          className="block size-full dark:hidden"
          decoding="async"
          height={1080}
          loading="lazy"
          sizes={sizes}
          {...dashboardPreviews.light}
          width={1920}
        />
        <img
          alt={alt}
          className="hidden size-full dark:block"
          decoding="async"
          fetchPriority={priority ? "high" : undefined}
          height={1080}
          loading={priority ? "eager" : "lazy"}
          sizes={sizes}
          {...dashboardPreviews.dark}
          width={1920}
        />
      </CardContent>
    </Card>
  );
}
