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
 * @param {Partial<PluginOptions> & { basePath?: string }} [options]
 * @returns {ReturnType<typeof rawParaglideVitePlugin>} a plugin for vite that integrates Paraglide for i18n support
 */
export function paraglideVitePlugin(options) {
  const { basePath, ...pluginOptions } = options ?? {};
  const normalizedBasePath = basePath?.replace(BASE_PATH_REGEX, "") ?? "";

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
    .concat([
      [baseLocale, normalizedBasePath ? `${normalizedBasePath}/:path(.*)?` : "/:path(.*)?"]
    ]);

  /** @type {PluginOptions} */
  const DEFAULT_OPTIONS = {
    outdir: resolve(I18N_ROOT, "src/paraglide"),
    outputStructure: "message-modules",
    project: resolve(I18N_ROOT, "project.inlang"),
    strategy: ["url", "preferredLanguage", "baseLocale"],
    urlPatterns: [
      {
        localized,
        pattern: normalizedBasePath ? `${normalizedBasePath}/:path(.*)?` : "/:path(.*)?"
      }
    ]
  };

  return rawParaglideVitePlugin({ ...DEFAULT_OPTIONS, ...pluginOptions });
}
