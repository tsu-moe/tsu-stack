import { type AnyRoute } from "@tanstack/react-router";

import { type LocalizedRouteInfo } from "#@/tanstack-start/lib/get-route-tree-paths-localized";
import { getRouteTreePathsLocalized } from "#@/tanstack-start/lib/get-route-tree-paths-localized";
import { type NavigateTo } from "#@/tanstack-start/types/index";

type AbsoluteNavigateTo = Extract<NavigateTo, `/${string}`>;

/**
 * Filter function that determines if a route should be included (like Array.filter)
 * Receives the full route information including ID, locale, and paths
 * Return true to keep the route valid, false to exclude it
 */
export type RouteFilter = (route: LocalizedRouteInfo) => boolean;

/**
 * Validates if a redirect URL is a valid, allowed route path in the application
 *
 * This function ensures that redirect URLs point to existing, accessible routes
 * and allows filtering routes using standard filter semantics (return true to keep).
 *
 * @param options - Configuration object
 * @param options.to - The URL to validate (typically from query params or storage)
 * @param options.fallbackTo - The default route to return if validation fails (default: '/')
 * @param options.shouldIncludeRoute - Filter function (return true to keep route, false to exclude)
 * @returns A validated absolute app path, or the fallback if validation fails
 *
 * @example
 * // Exclude guest routes (keep non-guest routes)
 * validateNavigateTo({ to: '/dashboard', shouldIncludeRoute: (route) => !route.id.includes('(guest)') })
 *
 * @example
 * // Exclude admin routes
 * validateNavigateTo({
 *   to: '/admin/users',
 *   fallbackTo: '/dashboard',
 *   shouldIncludeRoute: (route) => !route.id.includes('(admin)')
 * })
 *
 * @example
 * // Exclude multiple route types
 * validateNavigateTo({
 *   to: redirectTo,
 *   fallbackTo: '/',
 *   shouldIncludeRoute: (route) => !route.id.includes('(guest)') && !route.id.includes('(maintenance)')
 * })
 */
export function validateNavigateTo({
  routeTree,
  to,
  fallbackTo = "/",
  shouldIncludeRoute
}: {
  routeTree: AnyRoute;
  to: string | undefined;
  fallbackTo?: AbsoluteNavigateTo;
  shouldIncludeRoute: RouteFilter;
}): AbsoluteNavigateTo {
  // Handle empty or undefined redirect URLs
  if (!to) {
    return fallbackTo;
  }

  const normalizedTo = normalizeNavigateTo(to);
  const pathname = normalizeRoutePath(getNavigateToPathname(normalizedTo));

  // Retrieve all valid application routes with their localized paths
  const validRoutes = getRouteTreePathsLocalized(routeTree);

  // Attempt to find a route matching the provided URL
  const matchingRoute = validRoutes.find((route) => normalizeRoutePath(route.path) === pathname);

  // Return fallback if:
  // 1. No matching route exists in the route tree
  // 2. The route is excluded by the filter (filter returns false)
  if (!matchingRoute || !shouldIncludeRoute(matchingRoute)) {
    return fallbackTo;
  }

  // Type assertion is safe here because we've confirmed the route exists
  return normalizedTo as AbsoluteNavigateTo;
}

function normalizeNavigateTo(to: string): string {
  try {
    const normalizedUrl = new URL(to, "http://tsu-stack.local");
    return `${normalizedUrl.pathname}${normalizedUrl.search}${normalizedUrl.hash}`;
  } catch {
    return to;
  }
}

function getNavigateToPathname(to: string): string {
  const indexes = [to.indexOf("?"), to.indexOf("#")].filter((index) => index >= 0);
  const endIndex = indexes.length > 0 ? Math.min(...indexes) : undefined;

  return endIndex === undefined ? to : to.slice(0, endIndex);
}

function normalizeRoutePath(path: string): string {
  if (path === "/") {
    return path;
  }

  return path.endsWith("/") ? path.slice(0, -1) : path;
}
