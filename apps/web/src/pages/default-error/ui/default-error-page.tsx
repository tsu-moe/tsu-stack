import { Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { log } from "@tsu-stack/logger/client";
import { Button } from "@tsu-stack/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@tsu-stack/ui/components/empty";

import { CenteredLayout } from "@/widgets/layouts";

const loggedErrorKeys = new Set<string>();

export function DefaultErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    const errorKey = `${error.name}:${error.message}:${error.stack ?? ""}`;

    if (loggedErrorKeys.has(errorKey)) {
      return;
    }

    loggedErrorKeys.add(errorKey);

    log.error({
      action: "global_error_boundary",
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    });
  }, [error]);

  const handleRefresh = () => {
    reset();
  };

  // Could also send to external service
  // sendErrorToService(error)

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
