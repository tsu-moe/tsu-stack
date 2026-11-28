import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import { cva } from "class-variance-authority";
import { type ComponentProps, type ReactNode } from "react";

import { cn } from "@tsu-stack/ui/lib/utils";

const separatorVariants = cva(
  "shrink-0 data-[orientation=horizontal]:w-full data-[orientation=vertical]:not-[[class^='h-']]:not-[[class*='_h-']]:self-stretch",
  {
    variants: {
      variant: {
        solid: "bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
        dashed: [
          "bg-transparent",
          "data-[orientation=horizontal]:h-0 data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-dashed data-[orientation=horizontal]:border-border",
          "data-[orientation=vertical]:w-0 data-[orientation=vertical]:border-l data-[orientation=vertical]:border-dashed data-[orientation=vertical]:border-border"
        ]
      },
      lightSource: {
        none: "",
        above: "",
        below: "",
        right: "",
        left: ""
      }
    },
    compoundVariants: [
      {
        variant: "solid",
        lightSource: "above",
        className: "[box-shadow:0_1px_0_0_var(--background)] dark:[box-shadow:0_-1px_0_0_var(--background)]"
      },
      {
        variant: "solid",
        lightSource: "below",
        className: "[box-shadow:0_-1px_0_0_var(--background)] dark:[box-shadow:0_1px_0_0_var(--background)]"
      },
      {
        variant: "solid",
        lightSource: "right",
        className: "[box-shadow:-1px_0_0_0_var(--background)] dark:[box-shadow:1px_0_0_0_var(--background)]"
      },
      {
        variant: "solid",
        lightSource: "left",
        className: "[box-shadow:1px_0_0_0_var(--background)] dark:[box-shadow:-1px_0_0_0_var(--background)]"
      }
    ],
    defaultVariants: {
      variant: "solid",
      lightSource: "none"
    }
  }
);

const separatorContentVariants = cva(
  "flex min-w-0 items-center gap-3 bg-transparent! shadow-none! before:block before:flex-1 before:shrink-0 before:content-[''] after:block after:flex-1 after:shrink-0 after:content-['']",
  {
    variants: {
      orientation: {
        horizontal: "h-auto! flex-row before:h-px after:h-px",
        vertical: "w-auto! flex-col before:w-px after:w-px"
      },
      variant: {
        solid: "before:bg-border after:bg-border",
        dashed: [
          "border-0! before:bg-transparent after:bg-transparent",
          "data-[orientation=horizontal]:before:h-0! data-[orientation=horizontal]:before:border-t data-[orientation=horizontal]:before:border-dashed data-[orientation=horizontal]:before:border-border data-[orientation=horizontal]:after:h-0! data-[orientation=horizontal]:after:border-t data-[orientation=horizontal]:after:border-dashed data-[orientation=horizontal]:after:border-border",
          "data-[orientation=vertical]:before:w-0! data-[orientation=vertical]:before:border-l data-[orientation=vertical]:before:border-dashed data-[orientation=vertical]:before:border-border data-[orientation=vertical]:after:w-0! data-[orientation=vertical]:after:border-l data-[orientation=vertical]:after:border-dashed data-[orientation=vertical]:after:border-border"
        ]
      },
      lightSource: {
        none: "",
        above: "",
        below: "",
        right: "",
        left: ""
      }
    },
    compoundVariants: [
      {
        variant: "solid",
        lightSource: "above",
        className:
          "before:[box-shadow:0_-1px_0_0_var(--background)] after:[box-shadow:0_-1px_0_0_var(--background)] dark:before:[box-shadow:0_1px_0_0_var(--background)] dark:after:[box-shadow:0_1px_0_0_var(--background)]"
      },
      {
        variant: "solid",
        lightSource: "below",
        className:
          "before:[box-shadow:0_1px_0_0_var(--background)] after:[box-shadow:0_1px_0_0_var(--background)] dark:before:[box-shadow:0_-1px_0_0_var(--background)] dark:after:[box-shadow:0_-1px_0_0_var(--background)]"
      },
      {
        variant: "solid",
        lightSource: "right",
        className:
          "before:[box-shadow:1px_0_0_0_var(--background)] after:[box-shadow:1px_0_0_0_var(--background)] dark:before:[box-shadow:-1px_0_0_0_var(--background)] dark:after:[box-shadow:-1px_0_0_0_var(--background)]"
      },
      {
        variant: "solid",
        lightSource: "left",
        className:
          "before:[box-shadow:-1px_0_0_0_var(--background)] after:[box-shadow:-1px_0_0_0_var(--background)] dark:before:[box-shadow:1px_0_0_0_var(--background)] dark:after:[box-shadow:1px_0_0_0_var(--background)]"
      }
    ]
  }
);

type SeparatorContentProps = ComponentProps<"span">;

function SeparatorContent({ className, ...props }: SeparatorContentProps) {
  return <span data-slot="separator-content" className={cn("shrink-0", className)} {...props} />;
}

type SeparatorProps = SeparatorPrimitive.Props & {
  children?: ReactNode;
  lightSource?: "none" | "above" | "below" | "right" | "left";
  variant?: "solid" | "dashed";
};

type SeparatorVariant = NonNullable<SeparatorProps["variant"]>;
type SeparatorLightSource = NonNullable<SeparatorProps["lightSource"]>;

function Separator({
  className,
  children,
  orientation = "horizontal",
  variant = "solid",
  lightSource = "none",
  ...props
}: SeparatorProps) {
  const hasContent = children !== undefined && children !== null;

  return (
    <SeparatorPrimitive
      className={cn(
        separatorVariants({ lightSource, variant }),
        hasContent &&
          separatorContentVariants({
            lightSource,
            orientation,
            variant
          }),
        className
      )}
      data-light-source={lightSource}
      data-slot="separator"
      data-variant={variant}
      orientation={orientation}
      {...props}
      {...(hasContent ? { role: "presentation" } : {})}
    >
      {children}
    </SeparatorPrimitive>
  );
}

const SeparatorWithParts = Object.assign(Separator, {
  Content: SeparatorContent,
  Root: Separator
});

export { SeparatorWithParts as Separator, SeparatorContent };
export type { SeparatorContentProps, SeparatorLightSource, SeparatorProps, SeparatorVariant };
