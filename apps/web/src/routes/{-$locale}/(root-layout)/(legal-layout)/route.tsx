import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/widgets/layouts";

export const Route = createFileRoute("/{-$locale}/(root-layout)/(legal-layout)")({ component: LegalLayout });

function LegalLayout() {
  return (
    <SiteLayout>
      <article className="prose pt-8 pb-14 not-dark:prose-invert">
        <Outlet />
      </article>
    </SiteLayout>
  );
}
