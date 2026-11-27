import { DatabaseIcon, PanelsTopLeftIcon, RouteIcon, WorkflowIcon } from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";

export const requestSteps = [
  { path: "apps/web", description: m.home_page__workflow_web, icon: PanelsTopLeftIcon },
  { path: "packages/api", description: m.home_page__workflow_api, icon: RouteIcon },
  { path: "packages/core", description: m.home_page__workflow_service, icon: WorkflowIcon },
  { path: "packages/db", description: m.home_page__workflow_data, icon: DatabaseIcon }
];
