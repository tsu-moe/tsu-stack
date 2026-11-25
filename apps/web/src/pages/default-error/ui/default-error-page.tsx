import { type ErrorComponentProps } from "@tanstack/react-router";
import { Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { log } from "@tsu-stack/logger/client";
import { Button } from "@tsu-stack/ui/components/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@tsu-stack/ui/components/empty";

import { CenteredLayout } from "@/widgets/layouts";

const lastLoggedAt = new WeakMap<Error, number>();
const ERROR_LOG_INTERVAL_MS = 30_000;

export function DefaultErrorPage({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    if (!(error instanceof Error)) return;
    const now = Date.now();
    const lastLog = lastLoggedAt.get(error);
    if (lastLog !== undefined && now - lastLog < ERROR_LOG_INTERVAL_MS) return;
    lastLoggedAt.set(error, now);

    log.error({
      event: "ui.error.caught",
      error: { name: error.name }
    });
  }, [error]);

  const handleRefresh = () => {
    reset();
  };

  return (
    <CenteredLayout>
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="mask-b-from-20% mask-b-to-80% text-9xl font-extrabold">
            {m.error_500__title()}
          </EmptyTitle>
          <EmptyDescription className="-mt-8 text-nowrap text-foreground/80">
            {m.error_500__description_line_1()} <br />
            {m.error_500__description_line_2()}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button light="skeuomorphic" asChild>
              <Link to="/">
                <Home data-icon="inline-start" />
                {m.error_500__go_home()}
              </Link>
            </Button>

            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw data-icon="inline-start" />
              {m.error_500__try_again()}
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </CenteredLayout>
  );
}
