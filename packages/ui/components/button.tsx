"use client";

import { Button as BaseButton, type ButtonProps as BaseButtonProps } from "@base-ui/react/button";
import { cn } from "cn";
import { type CSSProperties, type ReactNode } from "react";
import { tv } from "tailwind-variants";

const buttonMix =
  "[--button-fg:currentColor] [--button-mix-amount:0%] [background-color:color-mix(in_oklch,var(--button-bg),var(--button-fg)_var(--button-mix-amount))] hover:[--button-mix-amount:10%] active:[--button-mix-amount:20%] data-pressed:[--button-mix-amount:20%]";

const buttonVariants = tv({
  base: [
    "group relative isolate inline-flex w-fit shrink-0 touch-manipulation cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap text-sm outline-hidden transform-gpu motion-reduce:transform-none",
    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-secondary-foreground forced-colors:focus-visible:outline-[Highlight]",
    "disabled:pointer-events-none disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60",
    "[transition:scale_100ms,box-shadow_200ms,background-color_200ms,opacity_200ms,--button-mix-amount_200ms,width_200ms] [transition-timing-function:cubic-bezier(.6,.04,.98,.335)] will-change-transform motion-reduce:transition-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 active:scale-98",
    "[&_[data-slot=button-section]]:flex [&_[data-slot=button-section]]:shrink-0 [&_[data-slot=button-section]]:items-center [&_[data-slot=button-section]]:justify-center"
  ],
  variants: {
    variant: {
      default: "[--button-bg:var(--primary)] font-medium text-primary-foreground",
      secondary: "[--button-bg:var(--secondary)] border-secondary text-secondary-foreground",
      outline:
        "border border-border bg-background shadow-[0_1px_1px_-0.5px_rgb(0_0_0/0.02),0_3px_3px_-1.5px_rgb(0_0_0/0.04)] hover:bg-accent active:bg-accent/80 hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground dark:border-input dark:bg-input/30 dark:shadow-[0_1px_1px_-0.5px_rgb(0_0_0/0.44),0_3px_3px_-2px_rgb(0_0_0/0.40)] dark:hover:bg-input/50 dark:aria-expanded:bg-input/50 dark:active:bg-input/40",
      ghost:
        "hover:bg-muted active:bg-muted/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 dark:aria-expanded:bg-muted/50 dark:active:bg-muted/40 focus-visible:bg-muted dark:focus-visible:bg-muted/50 focus-visible:border-primary/25",
      link: "text-primary hover:underline hover:underline-offset-4 hover:decoration-1 active:underline active:underline-offset-4 active:decoration-1 focus-visible:underline focus-visible:underline-offset-4 focus-visible:decoration-1",
      destructive:
        "[--button-bg:var(--destructive)] font-medium text-destructive-foreground ring-1 ring-[color-mix(in_oklch,var(--destructive),black_18%)] shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--destructive),white_30%),0_1px_2px_oklch(0.1_0_0_/_0.1)] focus-visible:border-destructive focus-visible:ring-destructive"
    },
    size: {
      default: "h-9 px-4 py-2 has-[>svg]:px-3 has-[>[data-slot=button-section]]:px-3",
      xs: "h-6 gap-1 px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1)-1px)] text-xs has-[>[data-slot=button-section]]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
      sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 has-[>[data-slot=button-section]]:px-2.5",
      lg: "h-10 px-6 has-[>svg]:px-4 has-[>[data-slot=button-section]]:px-4",
      xl: "h-12 px-[calc(--spacing(4)-1px)] py-[calc(--spacing(2)-1px)] text-base has-[>[data-slot=button-section]]:px-3.5 [&_svg:not([class*='size-'])]:size-4.5",
      "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
      "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
      icon: "size-9 [&_svg:not([class*='size-'])]:size-4",
      "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-4.5",
      "icon-xl": "size-12 [&_svg:not([class*='size-'])]:size-4.5"
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-sm",
      default: "rounded-lg",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full"
    },
    customColor: {
      false: "",
      true: ""
    }
  },
  compoundVariants: [
    { variant: "default", class: buttonMix },
    { variant: "secondary", class: buttonMix },
    { variant: "destructive", class: buttonMix },
    {
      variant: "default",
      customColor: false,
      class: [
        "ring-1 ring-[oklch(0.15_0_0)]",
        "shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--primary),white_30%),0_1px_2px_oklch(0.1_0_0_/_0.1)]"
      ]
    },
    {
      variant: "default",
      customColor: true,
      class: [
        "ring-1 ring-[var(--button-ring)]",
        "shadow-[inset_0_1px_0_0_var(--button-emphasis-bg),0_1px_2px_oklch(0.1_0_0_/_0.1)]"
      ]
    }
  ],
  defaultVariants: {
    variant: "default",
    size: "default",
    radius: "default",
    customColor: false
  }
});

type ButtonStyle = CSSProperties & {
  "--button-bg"?: string;
  "--button-fg"?: string;
  "--button-mix-amount"?: string;
  "--button-emphasis-bg"?: string;
  "--button-ring"?: string;
};

type SharedButtonProps = Omit<BaseButtonProps, "color" | "style"> & {
  /** Preserves link semantics when `render` supplies an anchor. */
  nativeLink?: boolean;
  leftSection?: ReactNode;
  radius?: "none" | "sm" | "default" | "lg" | "xl" | "full";
  rightSection?: ReactNode;
  size?: "default" | "xs" | "sm" | "lg" | "xl" | "icon-xs" | "icon-sm" | "icon" | "icon-lg" | "icon-xl";
  style?: ButtonStyle;
};
type ButtonPropsSource = SharedButtonProps &
  (
    | {
        /** CSS color used as the default variant's background color. */
        color: string;
        variant?: "default";
      }
    | {
        color?: never;
        variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
      }
  );

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type ButtonProps<TOmitted extends PropertyKey = never> = DistributiveOmit<ButtonPropsSource, TOmitted>;

type ButtonVariant = NonNullable<ButtonProps["variant"]>;
type ButtonSize = NonNullable<ButtonProps["size"]>;
type ButtonRadius = NonNullable<ButtonProps["radius"]>;

function Button({
  children,
  className,
  color,
  leftSection,
  nativeLink = false,
  radius = "default",
  rightSection,
  size = "default",
  style,
  variant = "default",
  ...props
}: ButtonProps) {
  const hasCustomColor = variant === "default" && color !== undefined;
  const colorStyle: ButtonStyle | undefined = hasCustomColor
    ? {
        "--button-emphasis-bg": `color-mix(in oklch, ${color}, white 30%)`,
        "--button-bg": color,
        "--button-ring": `color-mix(in oklch, ${color}, black 18%)`
      }
    : undefined;

  // Base UI treats Space as activation for non-native buttons. Links use Enter.
  const linkBehavior: Pick<BaseButtonProps, "nativeButton" | "role" | "onKeyDown" | "onKeyUp"> | undefined = nativeLink
    ? {
        nativeButton: false,
        role: "link",
        onKeyDown(event) {
          props.onKeyDown?.(event);
          if (event.key === " ") event.preventBaseUIHandler();
        },
        onKeyUp(event) {
          props.onKeyUp?.(event);
          if (event.key === " ") event.preventBaseUIHandler();
        }
      }
    : undefined;

  return (
    <BaseButton
      className={cn(buttonVariants({ customColor: hasCustomColor, radius, size, variant }), className)}
      data-color={hasCustomColor ? "custom" : undefined}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      style={{ ...colorStyle, ...style }}
      {...props}
      {...linkBehavior}
    >
      {leftSection != null && <span data-slot="button-section">{leftSection}</span>}
      {children}
      {rightSection != null && <span data-slot="button-section">{rightSection}</span>}
    </BaseButton>
  );
}

export { Button, buttonVariants };
export type { ButtonProps, ButtonRadius, ButtonSize, ButtonVariant };
