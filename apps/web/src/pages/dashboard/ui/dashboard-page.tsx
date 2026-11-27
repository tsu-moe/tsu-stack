import { AppShell } from "@/shared/ui/app-shell";
import { DashboardSkeleton } from "@/shared/ui/dashboard-skeleton";

import { useSignOutMutation } from "@/features/auth";

export function DashboardPage() {
  const signOut = useSignOutMutation();
  return (
    <AppShell onSignOut={() => signOut.mutate()}>
      <DashboardSkeleton />
    </AppShell>
  );
}
