"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

export type AccordionVariant =
  | "default"
  | "split"
  | "outline"
  | "inset"
  | "nested"
  | "isolated-bordered"
  | "isolated-filled"
  | "isolated-filled-bordered";

export type AccordionProps = BaseAccordion.Root.Props & {
  variant?: AccordionVariant;
};

const AccordionVariantContext = React.createContext<AccordionVariant>("default");

function Accordion({ className, multiple = false, variant = "default", ...props }: AccordionProps) {
  const isInset = variant === "inset" || variant === "nested";

  return (
    <AccordionVariantContext.Provider value={variant}>
      <BaseAccordion.Root
        data-slot="accordion"
        data-variant={variant}
        multiple={multiple}
        className={cn(
          "group/accordion flex w-full flex-col",
          variant === "split" && "space-y-2",
          variant === "outline" && "overflow-hidden rounded-lg border border-border bg-muted/55",
          isInset && "rounded-xl border border-border bg-muted/55 p-1 dark:bg-muted/55",
          className
        )}
        {...props}
      />
    </AccordionVariantContext.Provider>
  );
}

export type AccordionItemProps = BaseAccordion.Item.Props;

function AccordionItem({ className, ...props }: AccordionItemProps) {
  const variant = React.useContext(AccordionVariantContext);
  return (
    <BaseAccordion.Item
      data-slot="accordion-item"
      className={cn(
        "transition-[margin,border-radius,border] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]",
        variant === "default" && "border-b border-border last:border-b-0",
        variant === "split" && "overflow-hidden rounded-lg border border-border bg-card",
        variant === "outline" && "border-b border-border last:border-b-0",
        (variant === "inset" || variant === "nested") && "mt-0.5 first:mt-0",
        variant === "isolated-bordered" &&
          "relative overflow-hidden border border-border bg-card not-first:not-data-open:not-[[data-open]+&]:-mt-px first:rounded-t-lg last:rounded-b-lg data-open:mt-2 data-open:mb-2 data-open:rounded-lg data-open:first:mt-0 data-open:last:mb-0 [&:has(+_[data-open])]:rounded-b-lg [[data-open]+&]:rounded-t-lg",
        variant === "isolated-filled" &&
          "overflow-hidden bg-muted/55 first:rounded-t-lg last:rounded-b-lg data-open:my-2 data-open:rounded-lg data-open:first:mt-0 data-open:last:mb-0 [&:has(+_[data-open])]:rounded-b-lg [[data-open]+&]:rounded-t-lg",
        variant === "isolated-filled-bordered" &&
          "overflow-hidden bg-muted/55 not-last:border-b not-last:border-border first:rounded-t-lg last:rounded-b-lg data-open:my-2 data-open:rounded-lg data-open:border-transparent data-open:first:mt-0 data-open:last:mb-0 [&:has(+_[data-open])]:rounded-b-lg [&:has(+_[data-open])]:border-transparent [[data-open]+&]:rounded-t-lg",
        className
      )}
      {...props}
    />
  );
}

export type AccordionHeaderProps = BaseAccordion.Header.Props;

function AccordionHeader({ className, ...props }: AccordionHeaderProps) {
  return <BaseAccordion.Header data-slot="accordion-header" className={cn("not-prose", className)} {...props} />;
}

export type AccordionTriggerProps = {
  showIndicator?: boolean;
  indicatorType?: "chevron" | "plus";
  indicatorPosition?: "start" | "end";
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
} & BaseAccordion.Trigger.Props;

function AccordionTrigger({
  children,
  className,
  showIndicator = true,
  indicatorType = "plus",
  indicatorPosition = "end",
  icon,
  subtitle,
  ...props
}: AccordionTriggerProps) {
  const variant = React.useContext(AccordionVariantContext);
  const hasStartIndicator = showIndicator && indicatorPosition === "start";
  const hasEndIndicator = showIndicator && indicatorPosition === "end";

  const renderIndicator = () => {
    if (!showIndicator) return null;

    if (indicatorType === "chevron") {
      return (
        <span className="shrink-0 text-muted-foreground" aria-hidden="true">
          <ChevronDownIcon
            data-slot="accordion-indicator"
            className="size-4 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        </span>
      );
    }

    return (
      <span className="shrink-0 text-muted-foreground" aria-hidden="true">
        <PlusIcon
          data-slot="accordion-indicator"
          className="size-4 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
      </span>
    );
  };

  return (
    <AccordionHeader>
      <BaseAccordion.Trigger
        data-slot="accordion-trigger"
        data-has-icon={hasStartIndicator ? "true" : undefined}
        className={cn(
          "group/trigger flex w-full cursor-pointer items-center justify-between gap-3 p-3.5 text-left text-sm font-medium outline-none disabled:pointer-events-none disabled:opacity-60",
          variant === "default" && "px-0",
          variant === "split" && "rounded-t-lg",
          (variant === "nested" || variant === "inset") &&
            "rounded-lg px-3.5 py-2.5 hover:bg-card/55 dark:hover:bg-muted/35",
          // Indicator animations
          indicatorType === "chevron" && "[&[data-panel-open]_[data-slot=accordion-indicator]]:rotate-180",
          indicatorType === "plus" && "[&[data-panel-open]_[data-slot=accordion-indicator]]:rotate-90",
          className
        )}
        {...props}
      >
        {hasStartIndicator && renderIndicator()}

        {icon && !hasStartIndicator && (
          <span className="shrink-0 text-muted-foreground" aria-hidden="true">
            {icon}
          </span>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span>{children}</span>
          {subtitle && <span className="text-sm font-normal text-muted-foreground no-underline">{subtitle}</span>}
        </div>

        {hasEndIndicator && renderIndicator()}
      </BaseAccordion.Trigger>
    </AccordionHeader>
  );
}

export type AccordionContentProps = BaseAccordion.Panel.Props;

function AccordionContent({ children, className, ...props }: AccordionContentProps) {
  const variant = React.useContext(AccordionVariantContext);
  return (
    <BaseAccordion.Panel
      data-slot="accordion-content"
      className={cn(
        "h-(--accordion-panel-height) overflow-hidden text-sm transition-[height,opacity] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0"
      )}
      {...props}
    >
      <div
        className={cn(
          "p-3.5 text-muted-foreground",
          variant === "default" && "px-0",
          (variant === "default" ||
            variant === "split" ||
            variant === "outline" ||
            variant === "isolated-bordered" ||
            variant === "isolated-filled" ||
            variant === "isolated-filled-bordered") &&
            "pt-0",
          (variant === "nested" || variant === "inset") &&
            "mx-px my-1 rounded-lg bg-card p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_-0.5px_rgb(0_0_0/0.06),0_3px_3px_-1.5px_rgb(0_0_0/0.05)] dark:bg-muted/55 dark:shadow-[0_0_0_1px_rgb(0_0_0/0.12),0_1px_1px_-0.5px_rgb(0_0_0/0.18),0_3px_3px_-1.5px_rgb(0_0_0/0.16),inset_0_1px_0_0_rgb(255_255_255/0.02),inset_0_0_0_1px_rgb(255_255_255/0.02)] [[data-slot=accordion-item]:last-child_&]:mb-0",
          // Icon alignment - add left padding when parent item contains a trigger with icon
          "[[data-slot=accordion-item]:has([data-has-icon])_&]:pl-[calc(1rem+0.75rem)]",
          variant === "default" && "[[data-slot=accordion-item]:has([data-has-icon])_&]:pl-[calc(1rem+0.75rem)]",
          className
        )}
      >
        {children}
      </div>
    </BaseAccordion.Panel>
  );
}

function PlusIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.75 12C2.75 11.3096 3.30964 10.75 4 10.75H20C20.6904 10.75 21.25 11.3096 21.25 12C21.25 12.6904 20.6904 13.25 20 13.25H4C3.30964 13.25 2.75 12.6904 2.75 12Z"
        fill="currentColor"
        className="transition-opacity duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] in-data-panel-open:opacity-0"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.75C12.6904 2.75 13.25 3.30964 13.25 4V20C13.25 20.6904 12.6904 21.25 12 21.25C11.3096 21.25 10.75 20.6904 10.75 20V4C10.75 3.30964 11.3096 2.75 12 2.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

export { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger };
