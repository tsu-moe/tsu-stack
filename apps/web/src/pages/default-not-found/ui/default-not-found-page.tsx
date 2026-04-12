import { Home } from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@tsu-stack/ui/components/empty";

import { CenteredLayout } from "@/widgets/layouts";

export function DefaultNotFoundPage() {
  return (
    <CenteredLayout>
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="mask-b-from-20% mask-b-to-80% text-9xl font-extrabold">
            {m.error_404__title()}
          </EmptyTitle>
          <EmptyDescription className="-mt-8 text-nowrap text-foreground/80">
            {m.error_404__description_line_1()} <br />
            {m.error_404__description_line_2()}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button light="skeuomorphic" size="lg" asChild>
              <Link to="/">
                <Home data-icon="inline-start" />
                {m.error_404__go_home()}
              </Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </CenteredLayout>
  );
}
