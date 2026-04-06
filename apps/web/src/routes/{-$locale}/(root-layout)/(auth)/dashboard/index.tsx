import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@tsu-stack/api/client/tanstack-start/orpc";
import { m } from "@tsu-stack/i18n/messages";
import { Spinner } from "@tsu-stack/ui/components/spinner";
import { useIsClient } from "@tsu-stack/ui/hooks/use-is-client.hook";

import { Container } from "@/shared/ui/container";

export const Route = createFileRoute("/{-$locale}/(root-layout)/(auth)/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();

  const privateData = useQuery(orpc.private.data.queryOptions());
  const isClient = useIsClient();

  return (
    <Container>
      <h2 className="font-display mb-2 text-4xl">
        {m.dashboard_page__title()} {user.name}
      </h2>
      <section>
        <h2 className="font-display my-8 text-2xl">{m.dashboard_page__protected_rpc_route()}</h2>
        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${isClient && privateData.data && !privateData.isLoading ? `bg-success` : `bg-destructive`}`}
            />
            <span className="text-sm text-muted-foreground">
              {!isClient || privateData.isLoading
                ? m.dashboard_page__checking()
                : privateData.data
                  ? m.dashboard_page__successfully_fetched()
                  : m.dashboard_page__failed_to_fetch()}
            </span>
          </div>

          <pre className="overflow-auto rounded bg-muted p-2 text-sm">
            {isClient ? (
              JSON.stringify(privateData.data, null, 2)
            ) : (
              <Spinner className="mx-auto my-28" />
            )}
          </pre>
        </div>
      </section>
    </Container>
  );
}
