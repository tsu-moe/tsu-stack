import { Outlet, createFileRoute } from "@tanstack/react-router";

import { CenteredLayout } from "@/widgets/layouts";

export const Route = createFileRoute("/{-$locale}/(centered-layout)")({
  component: () => (
    <CenteredLayout>
      <Outlet />
    </CenteredLayout>
  )
});
