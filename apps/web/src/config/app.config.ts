import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";
import { baseLocale, locales } from "@tsu-stack/i18n/runtime";

const emailSupport = `support@${new URL(ENV_WEB_ISOMORPHIC.VITE_WEB_URL).host}`;

// We load it in vite.config.ts because they are originally from ENV_WEB_SERVER variables
declare const __BUILD_SOURCE_COMMIT__: string;

export const appConfig = Object.freeze({
  i18n: {
    baseLocale,
    cookieName: "LOCALE",
    locales,
  },
  site: {
    author: "tsu!moe",
    basePath: new URL(ENV_WEB_ISOMORPHIC.VITE_WEB_URL).pathname,
    baseUrl: new URL(ENV_WEB_ISOMORPHIC.VITE_WEB_URL).origin,
    description:
      "An opinionated Vite Plus (Vite+) monorepo featuring TanStack Start, Paraglide.js (i18n), Hono, oRPC, drizzle-orm, better-auth, and more.",
    emailSupport,
    jurisdictionCountry: "the Republic of the Philippines",
    longName: "Batteries-Included TanStack Start Monorepo Boilerplate Template | tsu!stack",
    serverLocation: "Japan",
    shortName: "tsu!stack",
    url: ENV_WEB_ISOMORPHIC.VITE_WEB_URL,
    version: __BUILD_SOURCE_COMMIT__,
  },
});
