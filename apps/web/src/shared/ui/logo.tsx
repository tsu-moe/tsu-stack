import type React from "react";

import { cn } from "@tsu-stack/ui/lib/utils";

import { LogoIcon } from "@/shared/assets/brand/logo-icon";

import { appConfig } from "@/config/app.config";

export function Logo({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span {...props} className={cn("inline-flex items-center gap-1.5 text-sm leading-none font-semibold", className)}>
      <LogoIcon aria-hidden="true" className="size-full w-auto shrink-0" />
      {appConfig.site.shortName}
    </span>
  );
}
