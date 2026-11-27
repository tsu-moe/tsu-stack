import type React from "react";

import { cn } from "@tsu-stack/ui/lib/utils";

import { appConfig } from "@/config/app.config";

export function LogoIcon(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg {...props} width="378" height="387" viewBox="0 0 378 387" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M124.734 19.8461H284.111L166.937 247.808H7.56006L124.734 19.8461Z" fill="#EC4E02" />
      <path
        d="M131.714 268.935L86.3296 357.231H253.266L370.44 129.269H247.231L175.441 268.935H131.714Z"
        fill="#93370A"
      />
    </svg>
  );
}

export function Logo({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span {...props} className={cn("inline-flex items-center gap-1.5 text-sm leading-none font-semibold", className)}>
      <LogoIcon aria-hidden="true" className="size-full w-auto shrink-0" />
      {appConfig.site.shortName}
    </span>
  );
}
