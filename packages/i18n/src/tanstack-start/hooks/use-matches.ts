import {
  type MakeRouteMatchUnion,
  type RegisteredRouter,
  useChildMatches as rawUseChildMatches,
  useMatches as rawUseMatches,
  useParentMatches as rawUseParentMatches,
} from "@tanstack/react-router";

import { stripLocalePrefix } from "#@/tanstack-start/lib/strip-locale-prefix";

type Match = MakeRouteMatchUnion<RegisteredRouter>;

function stripMatchesLocale(matches: readonly Match[]): Match[] {
  return matches.map((match) => {
    return {
      ...match,
      fullPath: stripLocalePrefix(match.fullPath),
      pathname: stripLocalePrefix(match.pathname),
    };
  });
}

/**
 * Localized wrapper for TanStack Router's `useMatches`.
 * Strips the locale prefix from `pathname` and `fullPath` on every match in the
 * returned array so consumers always work with clean paths like `/app/library`.
 */
export function useMatches(): Match[];
export function useMatches<TSelected>(opts: { select: (matches: Match[]) => TSelected }): TSelected;
export function useMatches<TSelected = unknown>(opts?: {
  select?: (matches: Match[]) => TSelected;
}): Match[] | TSelected {
  return rawUseMatches({
    select: (matches) => {
      const stripped = stripMatchesLocale(matches);
      return (opts?.select ? opts.select(stripped) : stripped) as TSelected;
    },
  }) as Match[] | TSelected;
}

/**
 * Localized wrapper for TanStack Router's `useParentMatches`.
 * Same locale-stripping behaviour as `useMatches` but limited to parent matches.
 */
export function useParentMatches(): Match[];
export function useParentMatches<TSelected>(opts: {
  select: (matches: Match[]) => TSelected;
}): TSelected;
export function useParentMatches<TSelected = unknown>(opts?: {
  select?: (matches: Match[]) => TSelected;
}): Match[] | TSelected {
  return rawUseParentMatches({
    select: (matches) => {
      const stripped = stripMatchesLocale(matches);
      return (opts?.select ? opts.select(stripped) : stripped) as TSelected;
    },
  }) as Match[] | TSelected;
}

/**
 * Localized wrapper for TanStack Router's `useChildMatches`.
 * Same locale-stripping behaviour as `useMatches` but limited to child matches.
 */
export function useChildMatches(): Match[];
export function useChildMatches<TSelected>(opts: {
  select: (matches: Match[]) => TSelected;
}): TSelected;
export function useChildMatches<TSelected = unknown>(opts?: {
  select?: (matches: Match[]) => TSelected;
}): Match[] | TSelected {
  return rawUseChildMatches({
    select: (matches) => {
      const stripped = stripMatchesLocale(matches);
      return (opts?.select ? opts.select(stripped) : stripped) as TSelected;
    },
  }) as Match[] | TSelected;
}
