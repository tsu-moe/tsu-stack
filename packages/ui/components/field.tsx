"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { cn } from "cn";
import { type ComponentProps } from "react";

import { Input } from "@tsu-stack/ui/components/input";

function Field({ className, ...props }: FieldPrimitive.Root.Props) {
  return <FieldPrimitive.Root className={cn("space-y-2", className)} data-slot="field" {...props} />;
}

function FieldLabel({ className, ...props }: FieldPrimitive.Label.Props) {
  return (
    <FieldPrimitive.Label
      className={cn(
        "flex items-center gap-2 text-sm/5 font-medium text-foreground select-none",
        "data-disabled:pointer-events-none data-disabled:opacity-60",
        className
      )}
      data-slot="field-label"
      {...props}
    />
  );
}

function FieldControl(props: FieldPrimitive.Control.Props) {
  return <Input data-slot="field-control" {...props} />;
}

function FieldDescription({ className, ...props }: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="field-description"
      {...props}
    />
  );
}

function FieldError({ className, ...props }: FieldPrimitive.Error.Props) {
  return (
    <FieldPrimitive.Error
      className={cn("text-sm font-medium text-destructive", className)}
      data-slot="field-error"
      {...props}
    />
  );
}

function FieldErrorSlot({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "-mt-2 grid h-0 overflow-clip [interpolate-size:allow-keywords] *:col-start-1 *:row-start-1",
        "transition-[height,margin-top] duration-150 ease-out motion-reduce:transition-none",
        "has-[[data-slot=field-error]:not([data-ending-style])]:mt-0 has-[[data-slot=field-error]:not([data-ending-style])]:h-auto",
        "*:data-[slot=field-error]:transition-opacity *:data-[slot=field-error]:duration-150 motion-reduce:*:data-[slot=field-error]:transition-none",
        "[&>[data-slot=field-error][data-ending-style]]:opacity-0 [&>[data-slot=field-error][data-starting-style]]:opacity-0",
        "[&:has(>[data-slot=field-error]:not([data-ending-style]))>[data-slot=field-error][data-ending-style]]:hidden",
        "[&:has(>[data-slot=field-error][data-ending-style])>[data-slot=field-error][data-starting-style]]:opacity-100",
        className
      )}
      data-slot="field-error-slot"
      {...props}
    />
  );
}

function FieldItem({ className, ...props }: FieldPrimitive.Item.Props) {
  return <FieldPrimitive.Item className={cn("flex items-start gap-3", className)} data-slot="field-item" {...props} />;
}

const FieldValidity = FieldPrimitive.Validity;

export { Field, FieldControl, FieldDescription, FieldError, FieldErrorSlot, FieldItem, FieldLabel, FieldValidity };
