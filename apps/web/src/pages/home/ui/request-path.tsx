import { ArrowUpRightIcon, DatabaseIcon, PanelsTopLeftIcon, RouteIcon, WorkflowIcon } from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tsu-stack/ui/components/card";

import { repositoryUrl } from "@/shared/ui/nav-links";

const requestSteps = [
  { path: "apps/web", description: m.home_page__workflow_web, icon: PanelsTopLeftIcon },
  { path: "packages/api", description: m.home_page__workflow_api, icon: RouteIcon },
  { path: "packages/core", description: m.home_page__workflow_service, icon: WorkflowIcon },
  { path: "packages/db", description: m.home_page__workflow_data, icon: DatabaseIcon }
];

export function RequestPathSection() {
  return (
    <section
      id="request-path"
      aria-labelledby="home-workflow-title"
      className="grid scroll-mt-24 items-center gap-8 py-12 lg:grid-cols-2 lg:gap-14 lg:py-16"
    >
      <div className="max-w-lg">
        <h2
          id="home-workflow-title"
          className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          {m.home_page__workflow_title()}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
          {m.home_page__workflow_description()}
        </p>
        <Button
          className="mt-6"
          radius="full"
          nativeLink
          render={<Link href={`${repositoryUrl}/tree/main/packages/api`} />}
        >
          {m.home_page__workflow_source()} <ArrowUpRightIcon data-icon="inline-end" aria-hidden="true" />
        </Button>
      </div>
      <div className="home-color-panel rounded-3xl p-4 sm:p-6" data-tone="sky">
        <Card variant="inset" className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <RouteIcon className="size-4 text-info-foreground" aria-hidden="true" />
              {m.home_page__workflow_panel_title()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ol className="flex flex-col gap-3">
              {requestSteps.map(({ path, description, icon: Icon }) => (
                <li key={path} className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-info/10 text-info-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <span className="block text-sm font-medium">{description()}</span>
                    <code className="text-xs text-muted-foreground">{path}</code>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
