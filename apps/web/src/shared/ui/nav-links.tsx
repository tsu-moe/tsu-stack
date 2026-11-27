import {
  CodeIcon,
  DatabaseIcon,
  FileTextIcon,
  GitPullRequestIcon,
  GlobeIcon,
  PackageIcon,
  ScaleIcon,
  TerminalIcon,
  WorkflowIcon
} from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";

import { GithubIcon } from "@/shared/ui/github-icon";

export type LinkItemType = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  description?: string;
};

export const repositoryUrl = "https://github.com/tsu-moe/tsu-stack";

export function getHomeNavigation() {
  const stack: LinkItemType[] = [
    { label: m.navbar__web_framework(), description: m.navbar__web_description(), href: "#stack", icon: <CodeIcon /> },
    { label: m.navbar__api(), description: m.navbar__api_description(), href: "#stack", icon: <WorkflowIcon /> },
    {
      label: m.navbar__database(),
      description: m.navbar__database_description(),
      href: "#stack",
      icon: <DatabaseIcon />
    },
    { label: m.navbar__locale(), description: m.navbar__locale_description(), href: "#stack", icon: <GlobeIcon /> }
  ];
  const resources: LinkItemType[] = [
    { label: "GitHub", description: m.navbar__repository_description(), href: repositoryUrl, icon: <GithubIcon /> },
    {
      label: m.navbar__issues(),
      description: m.navbar__issues_description(),
      href: `${repositoryUrl}/issues`,
      icon: <FileTextIcon />
    },
    {
      label: m.navbar__releases(),
      description: m.navbar__releases_description(),
      href: `${repositoryUrl}/releases`,
      icon: <PackageIcon />
    }
  ];
  const moreResources: LinkItemType[] = [
    {
      label: m.navbar__cli(),
      href: `${repositoryUrl}/blob/main/tools/create-tsu-stack/README.md`,
      icon: <TerminalIcon />
    },
    { label: m.navbar__license(), href: `${repositoryUrl}/blob/main/LICENSE`, icon: <ScaleIcon /> },
    { label: m.navbar__pull_requests(), href: `${repositoryUrl}/pulls`, icon: <GitPullRequestIcon /> }
  ];

  return { stack, resources, moreResources };
}
