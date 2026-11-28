import { Check, Languages } from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";
import { locales } from "@tsu-stack/i18n/runtime";
import { useLocale } from "@tsu-stack/i18n/tanstack-start/components/locale-provider";
import { Button } from "@tsu-stack/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@tsu-stack/ui/components/dropdown-menu";

export function LocaleSwitcher() {
  const { locale, switchLocale } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={m.navbar__switch_language()}
        render={<Button type="button" size="icon-sm" radius="full" variant="ghost" />}
      >
        <Languages aria-hidden="true" data-icon="inline-start" strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={locale}
          activeIcon={<Check aria-hidden="true" />}
          onValueChange={(value) => {
            const nextLocale = locales.find((item) => item === value);
            if (nextLocale) switchLocale(nextLocale);
          }}
        >
          {locales.map((item) => (
            <DropdownMenuRadioItem key={item} value={item} lang={item} closeOnClick>
              {m.language_name(undefined, { locale: item })}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
