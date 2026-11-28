import { Input as InputPrimitive } from "@base-ui/react/input";
import { tv } from "tailwind-variants";

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
    --shake-duration: 280ms;
    animation-duration: var(--shake-duration);
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

const inputVariants = tv({
  base: "relative block h-9 w-full min-w-0 truncate rounded-lg border border-input/70 not-dark:border-input bg-background px-3 py-2 text-base/5 text-foreground shadow-xs outline-0 outline-offset-0 outline-transparent outline-solid placeholder:text-muted-foreground/80 [transition:border-color_150ms_ease-out,outline-width_100ms_ease-out,outline-offset_100ms_ease-out,outline-color_100ms_ease-out] focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50 disabled:opacity-64 aria-invalid:border-destructive aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-destructive/50 focus-visible:aria-invalid:border-destructive focus-visible:aria-invalid:outline-destructive/50 [disabled,focus-visible,aria-invalid]:shadow-none dark:bg-input/32 sm:text-sm",
  variants: {
    size: {
      sm: "h-8 px-3",
      default: "",
      lg: "h-10 px-3"
    }
  },
  defaultVariants: {
    size: "default"
  }
});

export type InputProps = {
  size?: "sm" | "default" | "lg" | number;
} & Omit<InputPrimitive.Props, "size">;

function Input({ className, size = "default", ...props }: InputProps) {
  return (
    <>
      <style>{invalidShakeStyles}</style>
      <InputPrimitive
        className={cn(
          inputVariants({ size: typeof size === "number" ? "default" : size }),
          props.type === "search" &&
            "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
          props.type === "file" &&
            "flex items-center pt-2 pb-[9px] text-muted-foreground file:relative file:-top-0.5 file:me-3 file:rounded-lg file:border-input/70 file:bg-transparent file:py-0 file:align-middle file:text-base file:leading-5 file:font-medium file:text-foreground not-dark:file:border-input sm:file:text-sm",
          className
        )}
        data-invalid-shake="owner"
        data-slot="input"
        size={typeof size === "number" ? size : undefined}
        {...props}
      />
    </>
  );
}

export { Input };
