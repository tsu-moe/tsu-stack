import {
  type RegisteredRouter,
  type RouterState,
  useLocation as rawUseLocation,
} from "@tanstack/react-router";

import { stripLocalePrefix } from "#@/tanstack-start/lib/strip-locale-prefix";

type ParsedLocation = RouterState<RegisteredRouter["routeTree"]>["location"];

/**
 * Localized wrapper for TanStack Router's `useLocation`.
 * Automatically strips the `/{-$locale}` prefix from `pathname`, so consumers
 * always receive clean paths like `/app/library` instead of `/en/app/library`.
 */
export function useLocation(): ParsedLocation;
export function useLocation<TSelected>(opts: {
  select: (location: ParsedLocation) => TSelected;
}): TSelected;
export function useLocation<TSelected = unknown>(opts?: {
  select?: (location: ParsedLocation) => TSelected;
}): ParsedLocation | TSelected {
  return rawUseLocation({
    select: (loc) => {
      const stripped = {
        ...loc,
        pathname: stripLocalePrefix(loc.pathname),
      } as ParsedLocation;
      return (opts?.select ? opts.select(stripped) : stripped) as TSelected;
    },
  }) as ParsedLocation | TSelected;
}
