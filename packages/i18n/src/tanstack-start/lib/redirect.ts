import {
  type AnyRedirect,
  type RedirectOptions,
  type RegisteredRouter
} from "@tanstack/react-router";
import { redirect as rawRedirect } from "@tanstack/react-router";

import { baseLocale, getLocale } from "#@/paraglide/runtime";
import { type LOCALE_ROUTE_PREFIX } from "#@/tanstack-start/constants/index";
import { stripLocalePrefix } from "#@/tanstack-start/lib/strip-locale-prefix";

/**
 * Typed alias for a localized redirect call. `to` accepts locale-stripped app
 * routes and the locale prefix is injected automatically.
 *
 * This helper is intentionally typed around absolute destination routes rather
 * than route-bound redirects. That keeps destination `search` typing intact
 * without forcing unrelated route-context requirements onto simple redirects.
 */
export type LocalizedRedirect = <const TTo extends `/${string}`>(
  opts: Omit<
    RedirectOptions<
      RegisteredRouter,
      `/${typeof LOCALE_ROUTE_PREFIX}/`,
      `/${typeof LOCALE_ROUTE_PREFIX}${TTo}`
    >,
    "to" | "from"
  > & {
    to: TTo;
  }
) => AnyRedirect;

export const redirect: LocalizedRedirect = ((opts: {
  to: string;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}): AnyRedirect => {
  const locale = getLocale();
  const cleanTo = stripLocalePrefix(opts.to);
  const localizedTo = `/{-$locale}${cleanTo}`;

  return rawRedirect({
    ...opts,
    params: {
      locale: locale === baseLocale ? undefined : locale,
      ...(typeof opts.params === "object" ? opts.params : {})
    },
    to: localizedTo
  } as unknown as Parameters<typeof rawRedirect>[0]);
}) as unknown as LocalizedRedirect;
