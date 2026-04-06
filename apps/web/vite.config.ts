import { resolve } from "node:path";

import { ohImage } from "@lonik/oh-image/plugin";
import mdx from "@mdx-js/rollup";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite-plus";

import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";
import { ENV_WEB_SERVER } from "@tsu-stack/env/web/env.server";
import { locales } from "@tsu-stack/i18n/runtime";
import { paraglideVitePlugin } from "@tsu-stack/i18n/vite/plugin";

import { type FileRouteTypes } from "@/routeTree.gen";

/**
 * IMPORTANT: We define this explicitly here instead of crawling from the root (/) because
 * crawling can sometimes miss i18n routes that are not directly linked from the root.
 * We type it as FileRouteTypes['fullPaths'][] since prerender needs to have the `/` suffix or else we will get `Error: redirect count exceeded` on build.
 */
const ROUTES_TO_PRERENDER: FileRouteTypes["fullPaths"][] = [
  "/{-$locale}/",
  "/{-$locale}/playground/",
  "/{-$locale}/privacy-policy/",
  "/{-$locale}/sign-in/",
  "/{-$locale}/create-an-account/",
  "/sitemap.xml",
  "/robots.txt",
];

const PAGES_PRERENDER_CONFIG = [
  // Also prerender the default locale without the locale prefix
  ...ROUTES_TO_PRERENDER.map((path) => {
    return {
      path: path.replace("{-$locale}/", ""),
      prerender: { enabled: true },
    };
  }),
  // Prerender all locales with their locale prefix (including base locale since the prefix is removed on the client via router)
  ...locales.flatMap((loc) =>
    ROUTES_TO_PRERENDER.map((path) => {
      return {
        path: path.replace("{-$locale}", loc),
        prerender: { enabled: true },
      };
    }),
  ),
];

export default defineConfig({
  run: {
    tasks: {
      build: {
        command: "cross-env IS_BUILD=true pnpm dotenvx run -f ../../packages/env/.env -- vp build",
        dependsOn: ["@tsu-stack/i18n#build"],
        // These environment variables are dependencies of the build process and need to be passed here to be picked up by the Vite Task runner.
        // CAUTION: These are hardcoded into the image. You should consider Build Secrets for sensitive values.
        //          In Coolify, you need to check "Use Docker Build Secrets" in the Environment Variables tab.
        env: [
          "NODE_ENV",
          "VITE_SERVER_URL",
          "VITE_WEB_URL",
          "VITE_IMGPROXY_URL",
          "SOURCE_COMMIT",
          "BETTER_AUTH_SECRET",
          "DATABASE_URL",
        ],
      },
    },
  },

  /**
   * FIXME: This is needed for prerendering to work in Docker Compose builds
   * @see {@link https://github.com/TanStack/router/issues/6275}
   */
  preview: {
    host: "127.0.0.1",
  },
  base: new URL(ENV_WEB_ISOMORPHIC.VITE_WEB_URL).pathname,
  // Restart the dev server when env files in this directory change
  envDir: resolve(import.meta.dirname, "../../packages/env"),
  resolve: {
    tsconfigPaths: true,
  },
  define: {
    __BUILD_NODE_ENV__: JSON.stringify(ENV_WEB_SERVER.NODE_ENV),
    __BUILD_SOURCE_COMMIT__: JSON.stringify(ENV_WEB_SERVER.SOURCE_COMMIT),
  },
  server: {
    port: 3000,
  },
  plugins: [
    devtools(),
    mdx(),
    tanstackStart({
      pages: PAGES_PRERENDER_CONFIG,
      prerender: {
        enabled: true,
        // Only prerender paths defined in the PAGES_PRERENDER_CONFIG object
        autoStaticPathsDiscovery: false,
        // Disable crawling to avoid missing i18n routes, we are explicitly defining them in PAGES_PRERENDER_CONFIG
        crawlLinks: false,
      },
      server: {
        build: {
          // Don't allow changing of process.env.NODE_ENV at runtime
          staticNodeEnv: true,
        },
      },
    }),
    paraglideVitePlugin({
      basePath: new URL(ENV_WEB_ISOMORPHIC.VITE_WEB_URL).pathname,
    }),
    /** @see {@link https://tanstack.com/start/latest/docs/framework/react/guide/hosting} */
    nitro({
      baseURL: new URL(ENV_WEB_ISOMORPHIC.VITE_WEB_URL).pathname,
      /**
       * We need to add this or else we will get `Error: Cannot find module 'react'` during prod.
       * FIXME: I haven't found a fix or related issue yet, but this is where I got the idea to trace the deps:
       * @see {@link https://github.com/nuxt/nuxt/issues/20773}
       * Recent Discord discussion on the matter
       * @see {@link https://discord.com/channels/719702312431386674/1490005967067414608}
       */
      traceDeps: ["react", "react-dom"],
    }),
    viteReact(),
    /** @see {@link https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#react-compiler} */
    babel({
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
    ohImage({
      pl_show: true,
      transforms: {
        format: "webp",
        quality: 80,
      },
    }),
  ],
});
