import { cn } from "cn";
import { type ComponentProps, type SVGProps } from "react";
import { tv } from "tailwind-variants";

type SpinnerPrimitiveProps = SVGProps<SVGSVGElement>;

function SpinnerPrimitive({ className, ...props }: SpinnerPrimitiveProps) {
  return (
    <svg className={cn("size-full", className)} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
        fill="currentColor"
        opacity=".25"
      />
      <path
        d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
        fill="currentColor"
      >
        <animateTransform
          attributeName="transform"
          dur="7s"
          repeatCount="indefinite"
          type="rotate"
          values="0 12 12;360 12 12"
        />
      </path>
    </svg>
  );
}

const spinnerVariants = tv({
  base: "pointer-events-none relative inline-block animate-spin [animation-duration:0.75s] text-current motion-reduce:animate-none",
  variants: {
    size: {
      sm: "size-4",
      md: "size-6",
      lg: "size-8",
      xl: "size-10"
    }
  },
  defaultVariants: {
    size: "md"
  }
});

type SpinnerProps = {
  size?: "sm" | "md" | "lg" | "xl";
} & Omit<ComponentProps<"svg">, "color" | "display" | "opacity">;

function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <output aria-label="Loading" className={cn(spinnerVariants({ size }), className)} data-slot="spinner">
      <SpinnerPrimitive aria-hidden="true" {...props} />
    </output>
  );
}

export { Spinner, SpinnerPrimitive, spinnerVariants };
export type { SpinnerProps };
