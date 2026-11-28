"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { mergeProps } from "@base-ui/react/merge-props";
import * as React from "react";

import { cn } from "@tsu-stack/ui/lib/utils";

// Styles for invalid animation shake
const invalidShakeStyles = `
  @keyframes invalid-shake-replay {
    0% { transform: translateX(0); animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
    28.57% { transform: translateX(6px); animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
    57.14% { transform: translateX(-6px); animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
    78.57% { transform: translateX(4px); animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
    100% { transform: translateX(0); }
  }
  [data-invalid-shake="owner"] {
    animation-duration: 280ms;
    animation-timing-function: linear;
  }
  [data-invalid-shake="owner"].is-shaking[aria-invalid="true"],
  [data-invalid-shake="owner"].is-shaking[data-invalid],
  [data-invalid-shake="owner"].is-shaking:has([aria-invalid="true"]),
  [data-invalid-shake="owner"].is-shaking:has([data-invalid]) {
    animation-name: invalid-shake-replay;
    will-change: transform;
  }
  @media (prefers-reduced-motion: reduce) {
    [data-invalid-shake="owner"] {
      animation: none !important;
      transform: none !important;
    }
  }
`;

export type TextareaProps = {
  size?: "sm" | "default" | "lg" | number;
} & React.ComponentProps<"textarea">;

function Textarea({ className, size = "default", ...props }: TextareaProps) {
  return (
    <>
      <style>{invalidShakeStyles}</style>
      <FieldPrimitive.Control
        render={(defaultProps) => (
          <textarea
            className={cn(
              "relative block field-sizing-content min-h-17.5 w-full rounded-lg border border-input/70 bg-background px-3 py-2 text-base/5 shadow-xs outline-0 outline-offset-0 outline-transparent outline-solid [transition:border-color_150ms_ease-out,outline-width_100ms_ease-out,outline-offset_100ms_ease-out,outline-color_100ms_ease-out] not-dark:border-input placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50 disabled:opacity-64 aria-invalid:border-destructive aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-destructive/50 focus-visible:aria-invalid:border-destructive focus-visible:aria-invalid:outline-destructive/50 max-sm:min-h-20.5 sm:text-sm dark:bg-input/32 [disabled,focus-visible,aria-invalid]:shadow-none",
              size === "sm" && "min-h-16.5 px-[calc(--spacing(2.5)-1px)] py-[calc(--spacing(1)-1px)] max-sm:min-h-19.5",
              size === "lg" && "min-h-18.5 py-[calc(--spacing(2)-1px)] max-sm:min-h-21.5",
              className
            )}
            data-invalid-shake="owner"
            data-slot="textarea"
            {...mergeProps(defaultProps, props)}
          />
        )}
      />
    </>
  );
}

export { Textarea };
