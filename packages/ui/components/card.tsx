import { cn } from "cn";
import * as React from "react";
import { tv } from "tailwind-variants";

const cardVariants = tv({
  base: "flex flex-col rounded-xl border border-border bg-card text-card-foreground",
  variants: {
    variant: {
      default: "gap-4 py-4",
      inset: "p-1 bg-muted dark:bg-card"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

type CardProps = React.ComponentProps<"div"> & {
  variant?: "default" | "inset";
};

type CardVariant = NonNullable<CardProps["variant"]>;

const CardVariantContext = React.createContext<CardVariant>("default");

function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <CardVariantContext.Provider value={variant}>
      <div
        data-slot="card"
        data-card-variant={variant}
        className={cn(cardVariants({ variant }), className)}
        {...props}
      />
    </CardVariantContext.Provider>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  const variant = React.useContext(CardVariantContext);
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4",
        variant === "default" && "px-4",
        variant === "inset" && "px-3 py-3",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, children, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3 data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props}>
      {children}
    </h3>
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  const variant = React.useContext(CardVariantContext);
  return (
    <div
      data-slot="card-content"
      className={cn(
        variant === "default" && "px-4",
        variant === "inset" &&
          "flex flex-1 flex-col rounded-lg bg-card p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_-0.5px_rgb(0_0_0/0.06),0_3px_3px_-1.5px_rgb(0_0_0/0.05)] dark:bg-muted dark:shadow-[0_0_0_1px_rgb(0_0_0/0.12),0_1px_1px_-0.5px_rgb(0_0_0/0.18),0_3px_3px_-1.5px_rgb(0_0_0/0.16),inset_0_1px_0_0_rgb(255_255_255/0.02),inset_0_0_0_1px_rgb(255_255_255/0.02)]",
        className
      )}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  const variant = React.useContext(CardVariantContext);
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "mt-auto flex items-center justify-end",
        variant === "default" && "px-4 pt-4",
        variant === "inset" && "px-3 pt-2 pb-1",
        className
      )}
      {...props}
    />
  );
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants };
export type { CardProps, CardVariant };
