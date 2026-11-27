"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";

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

import { navGroups, type SidebarNavGroup, type SidebarNavItem } from "@/shared/ui/app-shared";

function linksForSearchGroup(group: SidebarNavGroup): SidebarNavItem[] {
  const only = group.items[0];
  if (group.items.length === 1 && only?.subItems && only.subItems.length > 0) {
    return only.subItems;
  }
  return group.items;
}

const groups: { heading: string; links: SidebarNavItem[] }[] = navGroups.map((group) => {
  return {
    heading: group.label,
    links: linksForSearchGroup(group)
  };
});

export function AppSearch() {
  const [open, setOpen] = useState(false);
  const { isMobile } = useSidebar();

  useKeypress({
    combo: ["/"],
    callback: () => setOpen(true)
  });

  return (
    <>
      <Button
        aria-label="Open search"
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
        description="Search for pages, resources, and navigation"
        onOpenChange={setOpen}
        open={open}
        title="Search"
      >
        <Command className="bg-background p-0" loop>
          <div className="px-1 pt-1 pb-2">
            <CommandInput placeholder="Search..." />
          </div>
          <CommandList className="border-t">
            <CommandEmpty>
              <Empty>
                <EmptyMedia variant="icon">
                  <SearchIcon />
                </EmptyMedia>
                <EmptyHeader>No results found.</EmptyHeader>
                <EmptyDescription>Try searching for something else.</EmptyDescription>
              </Empty>
            </CommandEmpty>
            {groups.map((group) => (
              <CommandGroup heading={group.heading} key={group.heading}>
                {group.links.map((link) => (
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
