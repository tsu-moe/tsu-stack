import { useLocation, useRouter } from "@tanstack/react-router";
import * as React from "react";

import { baseLocale, locales } from "#@/paraglide/runtime";
import { stripLocalePrefix } from "#@/tanstack-start/lib/strip-locale-prefix";

type Locale = (typeof locales)[number];

type LocaleContextValue = {
  locale: Locale;
  switchLocale: (locale: Locale) => void;
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return locales.find((locale) => locale === segment) ?? baseLocale;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = useLocation({ select: (location) => location.pathname });
  const locale = React.useMemo(() => getLocaleFromPathname(pathname), [pathname]);

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const switchLocale = React.useCallback(
    (nextLocale: Locale) => {
      if (typeof window === "undefined" || nextLocale === locale) {
        return;
      }

      const path = stripLocalePrefix(pathname);
      const to = nextLocale === baseLocale ? path : `/${nextLocale}${path}`;
      void router.navigate({ to, search: true, hash: true });
    },
    [locale, pathname, router]
  );

  return <LocaleContext.Provider value={{ locale, switchLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = React.useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
