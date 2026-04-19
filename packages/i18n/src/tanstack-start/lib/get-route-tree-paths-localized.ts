import { type AnyRoute } from "@tanstack/react-router";

import { baseLocale, locales } from "#@/paraglide/runtime";
import { type StripLocalePrefix } from "#@/tanstack-start/types/index";

/**
 * Represents a node in the TanStack Router route tree structure
 * Uses Duck typing to safely traverse the generated route tree
 */
type RouteNode = {
  children?: Array<RouteNode> | Record<string, RouteNode>;
  fullPath?: string;
  id?: string;
  options?: {
    children?: Array<RouteNode> | Record<string, RouteNode>;
  };
  path?: string;
};

/**
 * Basic route information extracted from the route tree
 */
type BaseRouteInfo = {
  /** TanStack Router generated route ID */
  id: AnyRoute["id"];
  /** Non-localized route path with {-$locale} placeholder */
  path: string;
};

/**
 * Localized route information with all locale variants
 */
export type LocalizedRouteInfo = {
  /** TanStack Router generated route ID */
  id: AnyRoute["id"];
  /** The locale code (e.g., 'en', 'de') */
  locale: (typeof locales)[number];
  /** Full path with trailing slash preserved */
  fullPath: string;
  /** Normalized path without trailing slash (except root '/') */
  path: StripLocalePrefix<AnyRoute["to"]>;
};

/**
 * Extracts all routes from the TanStack Router route tree
 * @returns Array of routes with their IDs and non-localized paths
 */
function getRouteTreePaths(routeTree: AnyRoute): Array<BaseRouteInfo> {
  const routes: Array<BaseRouteInfo> = [];

  function extractRoutes(route: RouteNode, parentPath = ""): void {
    if (!route.id) {
      return;
    }

    // Skip root route
    if (route.id === "__root__") {
      processChildren(route, "");
      return;
    }

    // Add route with its full path
    const fullPath = route.fullPath ?? parentPath + (route.path ?? "");
    routes.push({
      // Type assertion safe: we checked route.id exists at function start
      id: route.id as AnyRoute["id"],
      path: fullPath,
    });

    processChildren(route, fullPath);
  }

  function processChildren(route: RouteNode, fullPath: string): void {
    const childrenToProcess = route.children ?? route.options?.children;

    if (!childrenToProcess) {
      return;
    }

    const children = Array.isArray(childrenToProcess)
      ? childrenToProcess
      : Object.values(childrenToProcess);

    for (const child of children) {
      extractRoutes(child, fullPath);
    }
  }

  extractRoutes(routeTree as RouteNode);

  return routes;
}

const PATH_REGEX = /^\/+/;

/**
 * Generates localized route paths for all configured locales
 *
 * This function takes routes from the TanStack Router route tree and creates
 * locale-specific versions by replacing the {-$locale} placeholder with actual
 * locale codes (e.g., 'en', 'de'). The base locale routes have no prefix.
 *
 * @returns Array of localized routes with their IDs, locale codes, and paths
 *
 * @example
 * // For route: '/{-$locale}/dashboard' with locales ['en', 'de'] and baseLocale 'en'
 * // Returns:
 * // [
 * //   { id: '/{-$locale}/(root-layout)/(auth)/dashboard/', locale: 'en', path: '/dashboard', fullPath: '/dashboard' },
 * //   { id: '/{-$locale}/(root-layout)/(auth)/dashboard/', locale: 'de', path: '/de/dashboard', fullPath: '/de/dashboard' }
 * // ]
 */
export function getRouteTreePathsLocalized(routeTree: AnyRoute): Array<LocalizedRouteInfo> {
  const routes = getRouteTreePaths(routeTree);

  const localizedRoutes: Array<LocalizedRouteInfo> = [];

  for (const route of routes) {
    // Skip special routes like sitemap
    if (route.path === "/sitemap" || route.path === "/sitemap.xml") {
      continue;
    }

    // If route doesn't have locale placeholder, skip it (non-localized routes)
    if (!route.path.includes("{-$locale}")) {
      continue;
    }

    // Generate a route for each locale
    for (const locale of locales) {
      let localizedPath: string;

      if (locale === baseLocale) {
        // Remove {-$locale} for base locale: {-$locale}/path → /path
        localizedPath = route.path.replace("{-$locale}", "");
      } else {
        // Replace {-$locale} with locale: {-$locale}/path → de/path
        localizedPath = route.path.replace("{-$locale}", locale);
      }

      // Normalize: ensure single leading slash, no double slashes
      localizedPath = `/${localizedPath.replace(PATH_REGEX, "")}`.replace(/\/+/g, "/");

      // fullPath keeps trailing slash as-is, path removes it (except for root)
      const fullPath = localizedPath;
      const path = localizedPath === "/" ? "/" : localizedPath.replace(/\/+$/, "");

      localizedRoutes.push({
        fullPath,
        id: route.id,
        locale,
        path: path as StripLocalePrefix<AnyRoute["to"]>,
      });
    }
  }

  return localizedRoutes;
}
