"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { SearchIcon } from "lucide-react";
import { type ComponentProps, type ReactNode } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@tsu-stack/ui/components/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@tsu-stack/ui/components/input-group";
import { ScrollArea, ScrollAreaContent } from "@tsu-stack/ui/components/scroll-area";
import { cn } from "@tsu-stack/ui/lib/utils";

const commandSurface =
  "rounded-xl border-none bg-popover bg-clip-padding text-popover-foreground shadow-2xl ring-4 ring-border";

type CommandProps<ItemValue> = Omit<Autocomplete.Root.Props<ItemValue>, "defaultOpen" | "inline" | "items"> & {
  className?: string;
  items: NonNullable<Autocomplete.Root.Props<ItemValue>["items"]>;
};

function Command<ItemValue>({
  autoHighlight = "always",
  className,
  items,
  keepHighlight = true,
  open = true,
  ...props
}: CommandProps<ItemValue>) {
  return (
    <div
      className={cn(
        "flex max-h-[min(28rem,calc(100dvh-3rem))] min-h-0 w-full min-w-0 flex-col overflow-hidden",
        commandSurface,
        "in-data-[slot=command-dialog-popup]:rounded-none in-data-[slot=command-dialog-popup]:bg-transparent in-data-[slot=command-dialog-popup]:shadow-none in-data-[slot=command-dialog-popup]:ring-0",
        className
      )}
      data-slot="command"
    >
      <Autocomplete.Root
        {...props}
        autoHighlight={autoHighlight}
        inline
        // Base UI accepts flat or grouped items through separate overloads.
        items={items as readonly ItemValue[]}
        keepHighlight={keepHighlight}
        open={open}
      />
    </div>
  );
}

const CommandDialog = Dialog;

function CommandDialogTrigger<Payload>(props: ComponentProps<typeof DialogTrigger<Payload>>) {
  return <DialogTrigger data-slot="command-dialog-trigger" {...props} />;
}

function CommandDialogPopup({
  children,
  className,
  description,
  title = "Command palette",
  ...props
}: Omit<ComponentProps<typeof DialogContent>, "showCloseButton"> & { description?: string }) {
  return (
    <DialogContent
      className={cn(commandSurface, className)}
      data-slot="command-dialog-popup"
      portalClassName="relative z-50"
      {...props}
      showCloseButton={false}
    >
      <DialogTitle className="sr-only">{title}</DialogTitle>
      {description && <DialogDescription className="sr-only">{description}</DialogDescription>}
      {children}
    </DialogContent>
  );
}

function CommandInput(props: ComponentProps<typeof Autocomplete.Input>) {
  return (
    <InputGroup className="mx-2 mt-2 h-9 shrink-0 rounded-md bg-input/50 shadow-none" data-slot="command-input">
      <Autocomplete.Input render={<InputGroupInput className="h-full py-0" />} {...props} />
      <InputGroupAddon className="text-muted-foreground/75">
        <SearchIcon aria-hidden="true" />
      </InputGroupAddon>
    </InputGroup>
  );
}

function CommandContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col in-data-[slot=command-dialog-popup]:min-h-[min(22.75rem,60dvh)]",
        className
      )}
      data-slot="command-content"
      {...props}
    />
  );
}

function CommandList({
  emptyMessage = "No results found.",
  ...props
}: ComponentProps<typeof Autocomplete.List> & { emptyMessage?: ReactNode }) {
  return (
    <>
      <Autocomplete.Empty
        className="px-2 py-12 text-center text-sm text-muted-foreground empty:m-0 empty:p-0"
        data-slot="command-empty"
      >
        {emptyMessage}
      </Autocomplete.Empty>
      <ScrollArea
        className="min-h-0 flex-1 overflow-hidden has-[[data-slot=command-list][data-empty]]:hidden"
        hideScrollbar
        scrollShadow="vertical"
        viewportClassName="overflow-x-hidden scroll-pt-2 scroll-pb-1.5"
      >
        <ScrollAreaContent>
          <Autocomplete.List className="px-2 py-1.5 data-empty:hidden" data-slot="command-list" {...props} />
        </ScrollAreaContent>
      </ScrollArea>
    </>
  );
}

function CommandGroup(props: Autocomplete.Group.Props) {
  return <Autocomplete.Group className="block text-foreground" data-slot="command-group" {...props} />;
}

function CommandGroupLabel(props: Autocomplete.GroupLabel.Props) {
  return (
    <Autocomplete.GroupLabel
      className="w-full px-3 py-1.5 text-xs font-medium text-muted-foreground"
      data-slot="command-group-label"
      {...props}
    />
  );
}

function CommandCollection(props: Autocomplete.Collection.Props) {
  return <Autocomplete.Collection data-slot="command-collection" {...props} />;
}

function CommandItem(props: Autocomplete.Item.Props) {
  return (
    <Autocomplete.Item
      className={cn(
        "relative flex h-9 w-full min-w-0 cursor-default items-center gap-2 rounded-md border border-transparent px-3 text-sm font-medium outline-hidden select-none",
        "data-highlighted:border-input data-highlighted:bg-input/50 data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        "forced-colors:data-highlighted:outline-2 forced-colors:data-highlighted:-outline-offset-2 forced-colors:data-highlighted:outline-[Highlight]",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
      )}
      data-slot="command-item"
      {...props}
    />
  );
}

export {
  Command,
  CommandCollection,
  CommandContent,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList
};
