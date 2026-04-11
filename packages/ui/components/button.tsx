import { type VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "@tsu-stack/ui/lib/utils";

const buttonVariants = cva(
  [
    `group relative isolate inline-flex w-fit shrink-0 transform-gpu cursor-pointer touch-none items-center justify-center gap-1.5 overflow-hidden text-sm whitespace-nowrap outline-hidden motion-reduce:transform-none`,
    `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-secondary-foreground`,
    `disabled:scale-100 disabled:cursor-not-allowed disabled:bg-secondary disabled:opacity-60`,
    `[transition-timing-function:cubic-bezier(.6,.04,.98,.335)] will-change-transform [transition:scale_0.1s,box-shadow_0.2s,background_0.20s,width_0.2s]`,
    `active:scale-98 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
  ],
  {
    defaultVariants: {
      light: "none",
      radius: "default",
      size: "default",
      variant: "default",
    },
    variants: {
      light: {
        none: "",
        skeuomorphic: [
          // Tune the opacity according to your theme
          // The first shadow is the main sharp highlight, second shadow is the subtle depth
          `shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_2px_2px_rgba(255,255,255,0.08)]`,
          `dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_1px_3px_rgba(255,255,255,0.1)]`,
        ],
      },
      radius: {
        default: "rounded-md",
        full: "rounded-full",
        lg: "rounded-lg",
        none: "rounded-none",
        sm: "rounded-sm",
        xl: "rounded-xl",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        icon: "size-9 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-4.5",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xl": "size-12 [&_svg:not([class*='size-'])]:size-4.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        xl: "h-12 px-[calc(--spacing(4)-1px)] py-[calc(--spacing(2)-1px)] text-base [&_svg:not([class*='size-'])]:size-4.5",
        xs: "h-6 gap-1 rounded-md px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1)-1px)] text-xs [&_svg:not([class*='size-'])]:size-3",
      },
      variant: {
        default: `bg-linear-to-b from-primary/80 to-primary text-primary-foreground hover:from-primary/75 dark:from-primary dark:hover:from-primary/95`,
        destructive:
          "bg-destructive bg-linear-to-t from-destructive/90 to-destructive text-white hover:bg-destructive/90 focus-visible:border-destructive focus-visible:bg-destructive/90 focus-visible:ring-destructive",
        ghost: `text-primary hover:bg-primary/10 focus-visible:border-primary/25 focus-visible:bg-primary/10`,
        link: `text-primary hover:underline hover:decoration-1 hover:underline-offset-4 focus-visible:underline focus-visible:decoration-1 focus-visible:underline-offset-4`,
        outline: `border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50`,
        secondary:
          "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90 data-pressed:bg-secondary/90",
      },
    },
  },
);

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  radius = "default",
  light = "none",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-light={light}
      className={cn(buttonVariants({ className, light, radius, size, variant }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
