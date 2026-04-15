import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { orpc } from "@tsu-stack/api/client/tanstack-start/orpc";
import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { type To } from "@tsu-stack/i18n/tanstack-start/types";
import { Button } from "@tsu-stack/ui/components/button";
import { Skeleton } from "@tsu-stack/ui/components/skeleton";
import { useIsClient } from "@tsu-stack/ui/hooks/use-is-client.hook";

import { useLogger } from "@/shared/providers/logger-provider";
import { Container } from "@/shared/ui/container";
import { Image } from "@/shared/ui/image";

import { getServerTimeCardQueryOptions } from "./-components/server-time-card";

export const Route = createFileRoute("/{-$locale}/(root-layout)/playground/")({
  // TIP: We can await this if we want to not have an initial loading state, but it will block the entire page from rendering until the server component is ready.
  beforeLoad: async ({ context }) => {
    await context.queryClient.prefetchQuery(getServerTimeCardQueryOptions());
  },
  component: PlaygroundPage,
});

function PlaygroundPage() {
  const healthCheck = useQuery(orpc.health.live.queryOptions());
  const isClient = useIsClient();
  const logger = useLogger();

  const {
    data: ServerTimeCard,
    isPending: isPendingServerTimeCard,
    refetch,
  } = useQuery(getServerTimeCardQueryOptions());

  return (
    <Container>
      <section className="mb-8">
        <h2 className="font-display mb-2 text-4xl">
          {m.playground_page__react_server_components()}
        </h2>
        <p className="mb-8 text-muted-foreground">
          {m.playground_page__react_server_components_description()}
        </p>
        {isPendingServerTimeCard ? <Skeleton className="h-22.5" /> : ServerTimeCard}
        <Button className="mt-8" onClick={() => refetch()}>
          {m.playground_page__refetch()}
        </Button>
      </section>
      <section className="mb-8">
        <h2 className="font-display mb-8 text-4xl">{m.playground_page__image_optimization()}</h2>
        <div className="mb-4 h-64 overflow-hidden rounded-lg">
          <Image
            width={736}
            height={736}
            quality={20}
            priority
            className="size-full object-cover"
            src="/img/bg.jpg"
            alt={m.playground_page__background()}
            placeholder="blur"
          />
        </div>
        <Link
          href="https://www.freepik.com/free-photo/natural-background-with-bright-orange-flowers-foliage_29320322.htm#fromView=search&page=2&position=2&uuid=9d458c3a-fcfb-4920-9494-09b6b6ad3d5a&query=orange+flowers+landscape"
          className="text-sm text-muted-foreground hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Image by pvproductions on Freepik
        </Link>
      </section>
      <section className="mb-8">
        <h2 className="font-display mb-8 text-4xl">{m.playground_page__test_rpc()}</h2>
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-medium">{m.playground_page__api_status()}</h3>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${isClient && healthCheck.data && !healthCheck.isLoading ? `bg-success` : `bg-destructive`}`}
            />
            <span className="text-sm text-muted-foreground">
              {!isClient || healthCheck.isLoading
                ? m.playground_page__checking()
                : healthCheck.data
                  ? m.playground_page__connected()
                  : m.playground_page__disconnected()}
            </span>
          </div>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="font-display mb-8 text-4xl">{m.playground_page__test_error_handling()}</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              logger.debug("Throwing test error from playground page...");
              throw new Error("Test error");
              logger.debug("Error thrown!");
            }}
          >
            {m.playground_page__throw_error()}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              toast.info(m.playground_page__test_toast_message);
            }}
          >
            {m.playground_page__test_toast()}
          </Button>
          <Button variant="outline" asChild>
            <Link to={"/not-found" as To}>{m.playground_page__visit_not_found_page()}</Link>
          </Button>
          <Button variant="destructive" asChild>
            <Link to="/error">{m.playground_page__visit_error_page()}</Link>
          </Button>
        </div>
      </section>
    </Container>
  );
}
