import { m } from "@tsu-stack/i18n/messages";

import { repositoryUrl, scaffoldingUrl } from "@/shared/config/project-links";

export const authorProfileUrl = "https://github.com/tsu-moe";

export function getFooterResources() {
  return [
    { label: m.navbar__source(), href: repositoryUrl },
    { label: m.navbar__cli(), href: scaffoldingUrl },
    { label: m.navbar__issues(), href: `${repositoryUrl}/issues` },
    { label: m.navbar__releases(), href: `${repositoryUrl}/releases` }
  ];
}
