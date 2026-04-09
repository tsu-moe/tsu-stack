import { type NavigateOptions } from "@tanstack/react-router";
import { useNavigate as rawUseNavigate } from "@tanstack/react-router";

import { baseLocale, getLocale } from "#@/paraglide/runtime";
import { LOCALE_ROUTE_PREFIX } from "#@/tanstack-start/constants/index";
import { type LocalizedNavigate, type NavigateProps } from "#@/tanstack-start/types/index";
import { stripLocalePrefix } from "#@/tanstack-start/utils/strip-locale-prefix";

export function useNavigate<TDefaultFrom extends string = string>(_defaultOpts?: {
  from?: TDefaultFrom;
}): LocalizedNavigate<TDefaultFrom> {
  const navigate = rawUseNavigate(
    _defaultOpts?.from
      ? {
          from: `/${LOCALE_ROUTE_PREFIX}${_defaultOpts.from}` as NavigateOptions["from"],
        }
      : undefined,
  );

  const locale = getLocale();

  return ((args: NavigateProps): Promise<void> => {
    const { to, params, ...rest } = args;

    // Strip any existing locale prefix to avoid duplication
    const cleanTo = stripLocalePrefix(to as string);
    const localizedTo = `/${LOCALE_ROUTE_PREFIX}${cleanTo}` as NavigateOptions["to"];

    return navigate({
      params: {
        locale: locale === baseLocale ? undefined : locale,
        ...(typeof params === "object" ? params : {}),
      },
      to: localizedTo,
      ...rest,
    });
  }) as unknown as LocalizedNavigate<TDefaultFrom>;
}
