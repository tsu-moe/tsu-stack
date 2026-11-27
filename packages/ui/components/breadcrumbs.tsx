"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import { ChevronRightIcon, EllipsisIcon } from "lucide-react";
import * as React from "react";
import { type ComponentProps, type ReactNode } from "react";

type BreadcrumbProps = ComponentProps<"nav"> & {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "surface";
};

type BreadcrumbVariant = NonNullable<BreadcrumbProps["variant"]>;
type BreadcrumbSize = NonNullable<BreadcrumbProps["size"]>;

type BreadcrumbContextValue = {
  size: BreadcrumbSize;
  variant: BreadcrumbVariant;
};

const BreadcrumbContext = React.createContext<BreadcrumbContextValue>({
  size: "md",
  variant: "default"
});

function Breadcrumb({
  "aria-label": ariaLabel = "Breadcrumb",
  className,
  size = "md",
  variant = "default",
  ...props
}: BreadcrumbProps) {
  return (
    <BreadcrumbContext.Provider value={{ size, variant }}>
      <nav
        aria-label={ariaLabel}
        className={cn("group", className)}
        data-size={size}
        data-slot="breadcrumb"
        data-variant={variant}
        {...props}
      />
    </BreadcrumbContext.Provider>
  );
}

function BreadcrumbList({ className, ...props }: ComponentProps<"ol">) {
  const { size, variant } = React.useContext(BreadcrumbContext);
  return (
    <ol
      className={cn(
        "inline-flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5",
        size === "sm" && "gap-1 text-xs sm:gap-2",
        size === "lg" && "gap-2 text-base sm:gap-3",
        variant === "surface" && "rounded-lg border border-border/60 bg-muted/60 p-1 shadow-xs",
        className
      )}
      data-slot="breadcrumb-list"
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("inline-flex items-center gap-1.5", className)} data-slot="breadcrumb-item" {...props} />;
}

type BreadcrumbLinkProps = useRender.ComponentProps<"a">;

function BreadcrumbLink({ className, render, ...props }: BreadcrumbLinkProps) {
  const { variant } = React.useContext(BreadcrumbContext);
  const defaultProps = {
    className: cn(
      "rounded-sm transition-colors hover:text-foreground",
      "outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      variant === "surface" && "px-1.5 py-0.5",
      className
    ),
    "data-slot": "breadcrumb-link"
  };

  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(defaultProps, props),
    render
  });
}

function BreadcrumbPage({ className, ...props }: ComponentProps<"span">) {
  const { variant } = React.useContext(BreadcrumbContext);
  return (
    <span
      aria-current="page"
      className={cn(
        "font-normal text-foreground",
        variant === "surface" && "rounded-md bg-background px-2 py-1 shadow-xs ring-1 ring-border/60",
        className
      )}
      data-slot="breadcrumb-page"
      {...props}
    />
  );
}

type BreadcrumbSeparatorProps = ComponentProps<"li"> & {
  separator?: ReactNode;
};

function BreadcrumbSeparator({ children, className, separator, ...props }: BreadcrumbSeparatorProps) {
  const { size } = React.useContext(BreadcrumbContext);
  return (
    <li
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center [&>svg]:size-3.5",
        size === "sm" && "[&>svg]:size-3",
        size === "lg" && "[&>svg]:size-4",
        className
      )}
      data-slot="breadcrumb-separator"
      role="presentation"
      {...props}
    >
      {children ?? separator ?? <ChevronRightIcon />}
    </li>
  );
}

type BreadcrumbEllipsisProps = ComponentProps<"span"> & {
  "aria-label"?: string;
};

function BreadcrumbEllipsis({ "aria-label": ariaLabel = "More pages", className, ...props }: BreadcrumbEllipsisProps) {
  const { size } = React.useContext(BreadcrumbContext);
  return (
    <span
      className={cn(
        "flex size-9 items-center justify-center",
        size === "sm" && "size-7",
        size === "lg" && "size-11",
        className
      )}
      data-slot="breadcrumb-ellipsis"
      {...props}
    >
      <EllipsisIcon aria-hidden="true" className={cn("size-4", size === "sm" && "size-3", size === "lg" && "size-5")} />
      <span className="sr-only">{ariaLabel}</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
};
export type {
  BreadcrumbEllipsisProps,
  BreadcrumbLinkProps,
  BreadcrumbProps,
  BreadcrumbSeparatorProps,
  BreadcrumbSize,
  BreadcrumbVariant
};
