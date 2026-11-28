import { DashboardShell } from "./dashboard-shell";
import { DashboardSkeleton } from "./dashboard-skeleton";

export function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardSkeleton />
    </DashboardShell>
  );
}
