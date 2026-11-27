"use client";

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";

import { cn } from "@tsu-stack/ui/lib/utils";

export type CollapsibleProps = BaseCollapsible.Root.Props;

function Collapsible({ className, ...props }: CollapsibleProps) {
  return <BaseCollapsible.Root data-slot="collapsible" className={cn("group/collapsible", className)} {...props} />;
}

export type CollapsibleTriggerProps = BaseCollapsible.Trigger.Props;

function CollapsibleTrigger({ className, render, ...props }: CollapsibleTriggerProps) {
  return (
    <BaseCollapsible.Trigger
      data-slot="collapsible-trigger"
      render={render}
      className={cn(
        render
          ? "cursor-pointer"
          : "group flex w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left text-sm font-medium transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

export type CollapsibleContentProps = BaseCollapsible.Panel.Props;

function CollapsibleContent({ className, ...props }: CollapsibleContentProps) {
  return (
    <BaseCollapsible.Panel
      data-slot="collapsible-content"
      className={cn(
        "h-(--collapsible-panel-height) overflow-hidden text-sm transition-[height,opacity] duration-200 ease-out data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

export { Collapsible, Collapsible as CollapsibleRoot, CollapsibleTrigger, CollapsibleContent };
