import {
  type AnyRedirect,
  type NavigateOptions,
  type RegisteredRouter,
} from "@tanstack/react-router";
import { redirect as rawRedirect } from "@tanstack/react-router";

import { baseLocale, getLocale } from "#@/paraglide/runtime";
import { type LOCALE_ROUTE_PREFIX } from "#@/tanstack-start/constants/index";
import { stripLocalePrefix } from "#@/tanstack-start/lib/strip-locale-prefix";

/**
 * Typed alias for a localized redirect call. Mirrors the shape of
 * `LocalizedNavigate` but returns `AnyRedirect` instead of `Promise<void>` so
 * it can be used with `throw redirect(...)` in loaders and `beforeLoad`.
 *
 * `to` accepts locale-stripped paths (e.g. `/sign-in`). The `/{-$locale}` prefix
 * and the `locale` param are injected automatically.
 */
export type LocalizedRedirect = <TTo extends string>(
  opts: Omit<
    NavigateOptions<RegisteredRouter, string, `/${typeof LOCALE_ROUTE_PREFIX}${TTo}`>,
    "to" | "from"
  > & {
    to: TTo;
    code?: number;
    headers?: Record<string, string>;
  },
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
      ...(typeof opts.params === "object" ? opts.params : {}),
    },
    to: localizedTo,
  } as unknown as Parameters<typeof rawRedirect>[0]);
}) as unknown as LocalizedRedirect;
