import { Check, Languages } from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";
import { getLocale, locales, setLocale } from "@tsu-stack/i18n/runtime";
import { type ButtonProps } from "@tsu-stack/ui/components/button";
import { Button } from "@tsu-stack/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tsu-stack/ui/components/dropdown-menu";
import { cn } from "@tsu-stack/ui/lib/utils";

type LocaleSwitcherProps = {
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
};

export function LocaleSwitcher({
  size = "icon",
  variant = "ghost",
  className,
}: LocaleSwitcherProps) {
  const currentLocale = getLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Switch language" className={className} size={size} variant={variant}>
          <Languages aria-hidden="true" size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => {
          const isActive = locale === currentLocale;
          return (
            <DropdownMenuItem
              key={locale}
              className={cn("cursor-pointer gap-2", isActive && "bg-accent")}
              onClick={() => setLocale(locale)}
            >
              <span className="flex-1">{m.language_name(undefined, { locale })}</span>
              {isActive && <Check aria-hidden="true" className="opacity-60" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
