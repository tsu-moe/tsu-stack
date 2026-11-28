import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { paraglideVitePlugin as rawParaglideVitePlugin } from "@inlang/paraglide-js";

const BASE_PATH_REGEX = /\/$/;
const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N_ROOT = resolve(__dirname, "../..");

/**
 * @typedef {Parameters<typeof rawParaglideVitePlugin>[0]} PluginOptions
 */

/**
 * Compiles Paraglide for Vite and resolves the app's generated locale modules.
 *
 * @param {Partial<PluginOptions> & { basePath?: string }} [options]
 */
export function paraglideVitePlugin(options) {
  const { basePath, outdir, ...pluginOptions } = options ?? {};
  const normalizedBasePath = basePath?.replace(BASE_PATH_REGEX, "") ?? "";
  const basePathKey = createHash("sha256").update(normalizedBasePath).digest("hex").slice(0, 16);
  // Keep Vite's base-specific runtime separate from the CLI output and other app mounts.
  const generatedPath = resolve(outdir ?? resolve(I18N_ROOT, ".cache/paraglide", basePathKey)).replaceAll("\\", "/");

  // Read locales from project.inlang settings
  const settingsPath = resolve(I18N_ROOT, "project.inlang/settings.json");
  const settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
  const { baseLocale, locales } = settings;

  // Generate localized patterns dynamically
  // IMPORTANT: Non-base locales (more specific) must come BEFORE base locale (less specific)
  const localized = locales
    .filter((locale) => locale !== baseLocale)
    .map((locale) => [
      locale,
      normalizedBasePath ? `${normalizedBasePath}/${locale}/:path(.*)?` : `/${locale}/:path(.*)?`
    ])
    .concat([[baseLocale, normalizedBasePath ? `${normalizedBasePath}/:path(.*)?` : "/:path(.*)?"]]);

  /** @type {PluginOptions} */
  const DEFAULT_OPTIONS = {
    outdir: generatedPath,
    outputStructure: "message-modules",
    project: resolve(I18N_ROOT, "project.inlang"),
    strategy: ["url", "baseLocale"],
    urlPatterns: [
      {
        localized,
        pattern: normalizedBasePath ? `${normalizedBasePath}/:path(.*)?` : "/:path(.*)?"
      }
    ]
  };

  return [
    {
      name: "tsu-stack:paraglide-aliases",
      config: () => {
        return {
          resolve: {
            alias: [
              { find: /^@tsu-stack\/i18n\/(messages|runtime|server)$/, replacement: `${generatedPath}/$1.js` },
              { find: /^#@\/paraglide\/(.+)$/, replacement: `${generatedPath}/$1.js` }
            ]
          }
        };
      }
    },
    rawParaglideVitePlugin({ ...DEFAULT_OPTIONS, ...pluginOptions })
  ];
}
