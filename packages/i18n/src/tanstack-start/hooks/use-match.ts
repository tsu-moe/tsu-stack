import {
  type MakeRouteMatch,
  type MakeRouteMatchUnion,
  type RegisteredRouter,
  useMatch as rawUseMatch,
} from "@tanstack/react-router";

import { LOCALE_ROUTE_PREFIX } from "#@/tanstack-start/constants/index";
import { stripLocalePrefix } from "#@/tanstack-start/utils/strip-locale-prefix";

type LocalizedFrom<TFrom extends string> = `/${typeof LOCALE_ROUTE_PREFIX}${TFrom}`;

type LocalizedMatchResult<
  TFrom extends string | undefined,
  TStrict extends boolean,
  TSelected,
> = unknown extends TSelected
  ? TStrict extends true
    ? TFrom extends string
      ? MakeRouteMatch<RegisteredRouter["routeTree"], LocalizedFrom<TFrom>, TStrict>
      : MakeRouteMatchUnion<RegisteredRouter>
    : MakeRouteMatchUnion<RegisteredRouter>
  : TSelected;

/**
 * Localized wrapper for TanStack Router's `useMatch`.
 *
 * - `from`: accepts a locale-stripped route ID (e.g. `/(app-layout)/app/library`).
 *   The `/{-$locale}` prefix is prepended automatically.
 * - `pathname` and `fullPath` in the returned match object have their locale
 *   prefix stripped so consumers always work with clean paths.
 */
export function useMatch<
  const TFrom extends string | undefined = undefined,
  TStrict extends boolean = true,
  TSelected = unknown,
>(opts: {
  from?: TFrom;
  strict?: TStrict;
  shouldThrow?: boolean;
  select?: (
    match: TFrom extends string
      ? MakeRouteMatch<RegisteredRouter["routeTree"], LocalizedFrom<TFrom>, TStrict>
      : MakeRouteMatchUnion<RegisteredRouter>,
  ) => TSelected;
}): LocalizedMatchResult<TFrom, TStrict, TSelected> {
  const { from, select, ...rest } = opts;

  // oxlint-disable-next-line typescript-eslint(no-explicit-any)
  return (rawUseMatch as (opts: unknown) => unknown)({
    ...rest,
    ...(from !== undefined ? { from: `/${LOCALE_ROUTE_PREFIX}${from}` } : {}),
    select: (
      match: TFrom extends string
        ? MakeRouteMatch<RegisteredRouter["routeTree"], LocalizedFrom<TFrom>, TStrict>
        : MakeRouteMatchUnion<RegisteredRouter>,
    ) => {
      const stripped = {
        ...match,
        pathname: stripLocalePrefix(match.pathname),
        fullPath: stripLocalePrefix(match.fullPath),
      } as typeof match;
      return select ? select(stripped as Parameters<NonNullable<typeof select>>[0]) : stripped;
    },
  }) as LocalizedMatchResult<TFrom, TStrict, TSelected>;
}
