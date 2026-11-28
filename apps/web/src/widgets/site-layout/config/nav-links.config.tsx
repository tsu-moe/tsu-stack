import {
  BookOpenIcon,
  CircleHelpIcon,
  CodeIcon,
  DatabaseIcon,
  FileTextIcon,
  GitPullRequestIcon,
  GlobeIcon,
  PackageIcon,
  PanelsTopLeftIcon,
  ScaleIcon,
  ShieldCheckIcon,
  TerminalIcon,
  WorkflowIcon
} from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";

import { apiDocsUrl, repositoryUrl, scaffoldingUrl } from "@/shared/config/project-links";

import { type LinkItemType } from "@/widgets/site-layout/types";

export function getHomeNavigation() {
  const source = `${repositoryUrl}/tree/main`;
  const application: LinkItemType[] = [
    {
      label: m.navbar__web_app(),
      description: m.navbar__web_description(),
      href: `${source}/apps/web`,
      icon: <CodeIcon />
    },
    {
      label: m.navbar__api(),
      description: m.navbar__api_description(),
      href: `${source}/apps/server`,
      icon: <WorkflowIcon />
    },
    {
      label: m.navbar__ui_components(),
      description: m.navbar__ui_components_description(),
      href: `${source}/packages/ui`,
      icon: <PanelsTopLeftIcon />
    }
  ];
  const foundations: LinkItemType[] = [
    {
      label: m.navbar__database(),
      description: m.navbar__database_description(),
      href: `${source}/packages/db`,
      icon: <DatabaseIcon />
    },
    {
      label: m.navbar__authentication(),
      description: m.navbar__authentication_description(),
      href: `${source}/packages/auth`,
      icon: <ShieldCheckIcon />
    },
    {
      label: m.navbar__locale(),
      description: m.navbar__locale_description(),
      href: `${source}/packages/i18n`,
      icon: <GlobeIcon />
    }
  ];
  const guides: LinkItemType[] = [
    {
      label: m.navbar__implementation_guides(),
      href: `${repositoryUrl}/blob/main/.agents/end-to-end-features.md`,
      icon: <BookOpenIcon />
    },
    { label: m.navbar__cli(), href: scaffoldingUrl, icon: <TerminalIcon /> },
    { label: m.navbar__faq(), href: "#faq", icon: <CircleHelpIcon /> }
  ];
  const project: LinkItemType[] = [
    {
      label: m.navbar__issues(),
      description: m.navbar__issues_description(),
      href: `${repositoryUrl}/issues`,
      icon: <FileTextIcon />
    },
    { label: m.navbar__pull_requests(), href: `${repositoryUrl}/pulls`, icon: <GitPullRequestIcon /> },
    { label: m.navbar__license(), href: `${repositoryUrl}/blob/main/LICENSE`, icon: <ScaleIcon /> }
  ];

  const setup = {
    label: m.home_page__setup_link(),
    description: m.home_page__setup_link_description(),
    href: "#request-path",
    icon: <TerminalIcon aria-hidden="true" />
  };
  const releases = {
    label: m.navbar__releases(),
    description: m.navbar__releases_description(),
    href: `${repositoryUrl}/releases`,
    icon: <PackageIcon />
  };

  const directLinks = [
    { label: m.navbar__api_docs(), href: apiDocsUrl },
    { label: m.footer__github(), href: repositoryUrl }
  ];

  return { application, foundations, guides, project, setup, releases, directLinks };
}
