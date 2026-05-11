import * as React from "react";

import { cn } from "@tsu-stack/ui/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "relative h-9 w-full min-w-0 rounded-lg border border-input/70 bg-background px-3 py-2 text-base/5 shadow-xs outline-none [transition:box-shadow_150ms_ease-out] placeholder:text-muted-foreground/80 sm:text-sm dark:bg-input/32",
        "focus-visible:border-ring focus-visible:ring-[1px] focus-visible:ring-border",
        "disabled:opacity-64 aria-invalid:border-destructive/36 focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/16 dark:aria-invalid:ring-destructive/24 [disabled,focus-visible,aria-invalid]:shadow-none",
        type === "search" &&
          "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
        type === "file" &&
          "text-muted-foreground file:me-3 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Input };
