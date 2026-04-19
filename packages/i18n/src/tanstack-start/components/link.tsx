import { type LinkComponentProps } from "@tanstack/react-router";
import { Link as RawLink } from "@tanstack/react-router";
import { type FC } from "react";
import React from "react";

import { baseLocale, getLocale } from "#@/paraglide/runtime";
import { LOCALE_ROUTE_PREFIX } from "#@/tanstack-start/constants/index";
import { stripLocalePrefix } from "#@/tanstack-start/lib/strip-locale-prefix";
import { type LinkProps } from "#@/tanstack-start/types/index";

export type { LinkProps };

function isExternalLink(props: LinkProps): props is LinkProps & { href: string } {
  return "href" in props && typeof props.href === "string";
}

export const Link: FC<LinkProps> = (props) => {
  const locale = getLocale();

  if (isExternalLink(props)) {
    const { to: _to, params: _params, children, onClick, ...rest } = props;
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={props.href}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
      >
        {typeof children === "function"
          ? children({ isActive: false, isTransitioning: false })
          : children}
      </a>
    );
  }

  // Strip any existing locale prefix to avoid duplication
  const cleanTo = stripLocalePrefix(props.to as string);

  return (
    <RawLink
      {...props}
      params={{
        locale: locale === baseLocale ? undefined : locale,
        ...(typeof props.params === "object" ? props.params : {}),
      }}
      to={`/${LOCALE_ROUTE_PREFIX}${cleanTo}` as LinkComponentProps["to"]}
    />
  );
};
