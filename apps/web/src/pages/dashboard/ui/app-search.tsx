"use client";

import { SearchIcon } from "lucide-react";
import { useRef, useState } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import {
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
} from "@tsu-stack/ui/components/command";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@tsu-stack/ui/components/empty";
import { Kbd } from "@tsu-stack/ui/components/kbd";
import { useSidebar } from "@tsu-stack/ui/components/sidebar";
import { useKeypress } from "@tsu-stack/ui/hooks/use-keypress";

import { getDashboardNavigation } from "@/pages/dashboard/config/dashboard-navigation.config";
import { type SidebarNavGroup, type SidebarNavItem } from "@/pages/dashboard/types";

function linksForSearchGroup(group: SidebarNavGroup): SidebarNavItem[] {
  const only = group.items[0];
  if (group.items.length === 1 && only?.subItems && only.subItems.length > 0) {
    return only.subItems;
  }
  return group.items;
}

export function AppSearch() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { isMobile } = useSidebar();
  const { navGroups } = getDashboardNavigation();
  const searchGroups = navGroups.map((group) => {
    return { label: group.label, items: linksForSearchGroup(group) };
  });

  useKeypress({
    combo: "/",
    callback: () => setOpen(true)
  });

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      <CommandDialogTrigger
        aria-label={m.dashboard_search__open()}
        aria-keyshortcuts="/"
        className="md:gap-3 md:pe-1"
        ref={triggerRef}
        render={<Button size={isMobile ? "icon-sm" : "sm"} variant="outline" />}
      >
        <SearchIcon data-icon="inline-start" />
        <Kbd className="hidden md:inline-flex">/</Kbd>
      </CommandDialogTrigger>

      <CommandDialogPopup
        description={m.dashboard_search__description()}
        finalFocus={triggerRef}
        initialFocus={inputRef}
        title={m.dashboard_search__title()}
      >
        <Command items={searchGroups} itemToStringValue={(item: SidebarNavItem) => item.title}>
          <CommandContent>
            <CommandInput
              aria-label={m.dashboard_search__title()}
              placeholder={m.dashboard_search__placeholder()}
              ref={inputRef}
            />
            <CommandList
              emptyMessage={
                <Empty>
                  <EmptyMedia variant="icon">
                    <SearchIcon />
                  </EmptyMedia>
                  <EmptyHeader>{m.dashboard_search__no_results()}</EmptyHeader>
                  <EmptyDescription>{m.dashboard_search__try_again()}</EmptyDescription>
                </Empty>
              }
            >
              {(group: (typeof searchGroups)[number]) => (
                <CommandGroup items={group.items} key={group.label}>
                  <CommandGroupLabel>{group.label}</CommandGroupLabel>
                  <CommandCollection>
                    {(item: SidebarNavItem) => (
                      <CommandItem
                        key={item.hash}
                        onClick={() => setOpen(false)}
                        render={<Link to="/dashboard" hash={item.hash} />}
                        value={item}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </CommandItem>
                    )}
                  </CommandCollection>
                </CommandGroup>
              )}
            </CommandList>
          </CommandContent>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  );
}
