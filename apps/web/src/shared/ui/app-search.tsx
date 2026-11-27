"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Button } from "@tsu-stack/ui/components/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@tsu-stack/ui/components/command";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@tsu-stack/ui/components/empty";
import { Kbd, KbdGroup } from "@tsu-stack/ui/components/kbd";
import { useSidebar } from "@tsu-stack/ui/components/sidebar";
import { useKeypress } from "@tsu-stack/ui/hooks/use-keypress";

import { getDashboardNavigation, type SidebarNavGroup, type SidebarNavItem } from "@/shared/ui/app-shared";

function linksForSearchGroup(group: SidebarNavGroup): SidebarNavItem[] {
  const only = group.items[0];
  if (group.items.length === 1 && only?.subItems && only.subItems.length > 0) {
    return only.subItems;
  }
  return group.items;
}

export function AppSearch() {
  const [open, setOpen] = useState(false);
  const { isMobile } = useSidebar();
  const { navGroups } = getDashboardNavigation();

  useKeypress({
    combo: ["/"],
    callback: () => setOpen(true)
  });

  return (
    <>
      <Button
        aria-label={m.dashboard_search__open()}
        className="md:gap-3 md:pe-1"
        onClick={() => setOpen(true)}
        size={isMobile ? "icon-sm" : "sm"}
        variant="outline"
      >
        <SearchIcon data-icon="inline-start" />
        <KbdGroup className="hidden md:flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>

      <CommandDialog
        description={m.dashboard_search__description()}
        onOpenChange={setOpen}
        open={open}
        title={m.dashboard_search__title()}
      >
        <Command className="bg-background p-0" loop>
          <div className="px-1 pt-1 pb-2">
            <CommandInput placeholder={m.dashboard_search__placeholder()} />
          </div>
          <CommandList className="border-t">
            <CommandEmpty>
              <Empty>
                <EmptyMedia variant="icon">
                  <SearchIcon />
                </EmptyMedia>
                <EmptyHeader>{m.dashboard_search__no_results()}</EmptyHeader>
                <EmptyDescription>{m.dashboard_search__try_again()}</EmptyDescription>
              </Empty>
            </CommandEmpty>
            {navGroups.map((group) => (
              <CommandGroup heading={group.label} key={group.label}>
                {linksForSearchGroup(group).map((link) => (
                  <CommandItem key={link.title} onSelect={() => setOpen(false)} value={link.title}>
                    {link.icon}
                    <span>{link.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
