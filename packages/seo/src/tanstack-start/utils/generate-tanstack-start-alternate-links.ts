import {
  type TanStackStartSeoAlternates,
  type TanStackStartSeoLinkTag,
  type TanStackStartSeoSite
} from "#@/tanstack-start/types";
import { getLocalizedCanonicalPath } from "#@/tanstack-start/utils/get-localized-canonical-path";
import { resolveRelativePathToAbsoluteUrl } from "#@/tanstack-start/utils/resolve-relative-path-to-absolute-url";

export function generateTanStackStartAlternateLinks({
  baseLocale,
  basePath = "",
  baseUrl,
  canonicalPath,
  locale,
  locales
}: TanStackStartSeoAlternates & Pick<TanStackStartSeoSite, "basePath" | "baseUrl">): TanStackStartSeoLinkTag[] {
  const routeBaseUrl = new URL("/", baseUrl);
  routeBaseUrl.pathname = `${basePath.replace(/\/+$/, "")}/`;

  const hrefForLocale = (locale?: string) =>
    resolveRelativePathToAbsoluteUrl(`.${getLocalizedCanonicalPath({ baseLocale, canonicalPath, locale })}`, {
      baseUrl: routeBaseUrl
    });

  const links: TanStackStartSeoLinkTag[] = [
    {
      href: hrefForLocale(locale),
      rel: "canonical"
    }
  ];

  if (!locales?.length) {
    return links;
  }

  for (const currentLocale of locales) {
    links.push({
      href: hrefForLocale(currentLocale),
      hrefLang: currentLocale,
      rel: "alternate"
    });
  }

  if (baseLocale) {
    links.push({
      href: hrefForLocale(baseLocale),
      hrefLang: "x-default",
      rel: "alternate"
    });
  }

  return links;
}
