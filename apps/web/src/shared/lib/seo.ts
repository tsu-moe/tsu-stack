import { resolvePublicAssetUrl } from "@tsu-stack/core/assets";
import { m } from "@tsu-stack/i18n/messages";
import { getLocale } from "@tsu-stack/i18n/runtime";
import {
  generateTanStackStartSeo,
  type GenerateTanStackStartSeoParams,
  type TanStackStartSeoAlternates,
  type TanStackStartSeoSite
} from "@tsu-stack/seo";

import { appConfig } from "@/config/app.config";

const site = {
  applicationName: appConfig.site.shortName,
  basePath: appConfig.site.basePath,
  baseUrl: appConfig.site.baseUrl,
  defaultImages: [
    {
      alt: appConfig.site.shortName,
      height: 630,
      type: "image/png",
      url: resolvePublicAssetUrl(appConfig.site.url, "/og/index.png"),
      width: 1200
    }
  ],
  defaultTitle: appConfig.site.longName,
  siteName: appConfig.site.shortName,
  titleTemplate: `%s | ${appConfig.site.shortName}`
} satisfies TanStackStartSeoSite;

type AppSeoOptions = Omit<GenerateTanStackStartSeoParams, "alternates" | "site"> & {
  alternates?: Omit<TanStackStartSeoAlternates, "baseLocale" | "locales">;
};

export function generateAppSeo({ alternates, ...options }: AppSeoOptions) {
  const locale = appConfig.i18n.locales.find((item) => item === alternates?.locale) ?? getLocale();
  const defaultTitle =
    locale === appConfig.i18n.baseLocale
      ? site.defaultTitle
      : m.site__seo_title({ siteName: appConfig.site.shortName }, { locale });
  return generateTanStackStartSeo({
    ...options,
    alternates: alternates
      ? {
          ...alternates,
          baseLocale: appConfig.i18n.baseLocale,
          locales: appConfig.i18n.locales
        }
      : undefined,
    site: {
      ...site,
      defaultDescription: m.site__seo_description(undefined, { locale }),
      defaultTitle,
      titleTemplate: options.title ? site.titleTemplate : undefined
    }
  });
}
