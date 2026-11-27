import { Card, CardContent } from "@tsu-stack/ui/components/card";
import { cn } from "@tsu-stack/ui/lib/utils";

import { dashboardPreviews } from "@/shared/assets/dashboard-preview";

export function DashboardPreview({
  alt,
  className,
  priority = false
}: {
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const loading = priority ? "eager" : "lazy";
  const fetchPriority = priority ? "high" : undefined;

  return (
    <Card variant="inset" className={cn("border-none bg-background/15 p-2 shadow-xl", className)}>
      <CardContent className="aspect-video overflow-hidden p-0">
        <img
          alt={alt}
          className="block size-full dark:hidden"
          decoding="async"
          fetchPriority={fetchPriority}
          height={1080}
          loading={loading}
          src={dashboardPreviews.light}
          width={1920}
        />
        <img
          alt={alt}
          className="hidden size-full dark:block"
          decoding="async"
          fetchPriority={fetchPriority}
          height={1080}
          loading={loading}
          src={dashboardPreviews.dark}
          width={1920}
        />
      </CardContent>
    </Card>
  );
}
