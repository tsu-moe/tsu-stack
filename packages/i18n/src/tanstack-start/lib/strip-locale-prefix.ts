import { locales } from "#@/paraglide/runtime";

/**
 * Strips the locale prefix from a path if present.
 * Handles both actual locale values (e.g., /de/dashboard) and the route pattern (/{-$locale}/dashboard)
 * Recursively removes duplicate locale prefixes (e.g., /de/de/dashboard => /dashboard)
 *
 * @example
 * stripLocalePrefix('/de/dashboard') // => '/dashboard'
 * stripLocalePrefix('/de/de/dashboard') // => '/dashboard'
 * stripLocalePrefix('/dashboard') // => '/dashboard'
 * stripLocalePrefix('/{-$locale}/dashboard') // => '/dashboard'
 */
export function stripLocalePrefix(path: string): string {
  if (!path || path === "/") {
    return path;
  }

  let cleanPath = path;

  // Handle route pattern: /{-$locale}/...
  while (cleanPath.startsWith("/{-$locale}")) {
    cleanPath = cleanPath.replace("/{-$locale}", "") || "/";
  }

  // Handle actual locale values: /de/..., /en/..., etc.
  // Keep stripping until no more locale prefixes are found
  let changed = true;
  while (changed) {
    changed = false;
    for (const locale of locales) {
      const localePrefix = `/${locale}`;
      if (cleanPath === localePrefix) {
        return "/";
      }
      if (cleanPath.startsWith(`${localePrefix}/`)) {
        cleanPath = cleanPath.slice(localePrefix.length);
        changed = true;
        break;
      }
    }
  }

  return cleanPath;
}
