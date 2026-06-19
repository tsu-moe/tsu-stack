import { useLocation, useRouter } from "@tanstack/react-router";
import * as React from "react";

import { baseLocale, locales, localizeUrl, overwriteGetLocale } from "#@/paraglide/runtime";

type Locale = (typeof locales)[number];

type LocaleContextValue = {
  locale: Locale;
  switchLocale: (locale: Locale) => void;
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

let clientLocale: Locale | undefined;

function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];

  if (locales.includes(segment as Locale)) {
    return segment as Locale;
  }

  return baseLocale;
}

function setClientLocale(locale: Locale) {
  clientLocale = locale;
  overwriteGetLocale(() => clientLocale ?? baseLocale);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = useLocation({ select: (location) => location.pathname });
  const locale = React.useMemo(() => getLocaleFromPathname(pathname), [pathname]);

  React.useEffect(() => {
    setClientLocale(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const switchLocale = React.useCallback(
    (nextLocale: Locale) => {
      if (typeof window === "undefined") {
        return;
      }

      const nextUrl = localizeUrl(window.location.href, {
        locale: nextLocale
      });

      setClientLocale(nextLocale);
      document.documentElement.lang = nextLocale;
      router.history.push(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    },
    [router]
  );

  return (
    <LocaleContext.Provider value={{ locale, switchLocale }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = React.useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
