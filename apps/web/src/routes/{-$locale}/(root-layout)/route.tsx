import { Outlet, createFileRoute } from "@tanstack/react-router";

import { RootLayout } from "@/widgets/layouts";

export const Route = createFileRoute("/{-$locale}/(root-layout)")({
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  )
});
