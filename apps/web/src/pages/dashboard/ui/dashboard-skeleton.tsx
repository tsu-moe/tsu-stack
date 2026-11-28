import { cn } from "@tsu-stack/ui/lib/utils";

export function DashboardSkeleton() {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 p-px lg:grid-cols-4",
        "*:min-h-48 *:w-full *:rounded-lg *:border *:bg-background"
      )}
    >
      <div />
      <div />
      <div />
      <div />
      <div className="col-span-2 min-h-114! lg:col-span-4" />
      <div className="col-span-2 min-h-92! lg:col-span-2" />
      <div className="col-span-2 min-h-92! lg:col-span-2" />
    </div>
  );
}
