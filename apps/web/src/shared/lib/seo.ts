import { resolvePublicAssetUrl } from "@tsu-stack/core/assets";
import {
  generateTanStackStartSeo,
  type GenerateTanStackStartSeoParams,
  type TanStackStartSeoAlternates,
  type TanStackStartSeoSite
} from "@tsu-stack/seo";

import { appConfig } from "@/config/app.config";

const site = {
  applicationName: appConfig.site.longName,
  baseUrl: appConfig.site.baseUrl,
  defaultDescription: appConfig.site.description,
  defaultImages: [
    {
      alt: appConfig.site.longName,
      height: 630,
      type: "image/png",
      url: resolvePublicAssetUrl(appConfig.site.url, "/og/index.png"),
      width: 1200
    }
  ],
  defaultTitle: appConfig.site.longName,
  siteName: appConfig.site.longName,
  titleTemplate: `%s | ${appConfig.site.shortName}`
} satisfies TanStackStartSeoSite;

type AppSeoOptions = Omit<GenerateTanStackStartSeoParams, "alternates" | "site"> & {
  alternates?: Omit<TanStackStartSeoAlternates, "baseLocale" | "locales">;
};

export function generateAppSeo({ alternates, ...options }: AppSeoOptions) {
  return generateTanStackStartSeo({
    ...options,
    alternates: alternates
      ? {
          ...alternates,
          baseLocale: appConfig.i18n.baseLocale,
          locales: appConfig.i18n.locales
        }
      : undefined,
    site
  });
}
