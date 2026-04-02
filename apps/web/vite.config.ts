import { resolve } from "node:path";

import { cloudflare } from "@cloudflare/vite-plugin";
import { ohImage } from "@lonik/oh-image/plugin";
import mdx from "@mdx-js/rollup";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

import { ENV_WEB_ISOMORPHIC } from "@tsu-stack/env/web/env.isomorphic";
import { ENV_WEB_SERVER } from "@tsu-stack/env/web/env.server";
import { paraglideVitePlugin } from "@tsu-stack/i18n/vite/plugin";

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
    dedupe: ["react", "react-dom"],
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
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart({
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
