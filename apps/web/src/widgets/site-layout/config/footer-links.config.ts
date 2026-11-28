import { m } from "@tsu-stack/i18n/messages";

import { apiDocsUrl, repositoryUrl } from "@/shared/config/project-links";

export const authorProfileUrl = "https://github.com/tsu-moe";

export function getFooterExploreLinks() {
  return [
    { label: m.home_page__setup_link(), href: "#request-path" },
    { label: m.navbar__faq(), href: "#faq" },
    { label: m.navbar__api_docs(), href: apiDocsUrl }
  ];
}

export function getFooterProjectLinks() {
  return [
    { label: m.footer__github(), href: repositoryUrl },
    { label: m.navbar__releases(), href: `${repositoryUrl}/releases` }
  ];
}
