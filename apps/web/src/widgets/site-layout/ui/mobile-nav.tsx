"use client";

import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@tsu-stack/ui/components/accordion";
import { Button } from "@tsu-stack/ui/components/button";
import { Sheet, SheetCloseTrigger, SheetContent, SheetTitle, SheetTrigger } from "@tsu-stack/ui/components/sheet";

import { repositoryUrl } from "@/shared/config/project-links";

import { getHomeNavigation } from "@/widgets/site-layout/config/nav-links.config";

import { NavLinkItem } from "./nav-link-item";

export function MobileNav({ showGuestActions }: { showGuestActions: boolean }) {
  const [open, setOpen] = useState(false);
  const { stack, resources, moreResources, setup } = getHomeNavigation();
  const sections = [
    { id: "stack", title: m.navbar__stack(), items: [...stack, setup] },
    { id: "resources", title: m.navbar__resources(), items: resources },
    { id: "project", title: m.home_page__nav_project(), items: moreResources }
  ];
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={m.navbar__toggle_menu()}
        render={<Button className="lg:hidden" radius="full" size="icon-sm" variant="ghost" />}
      >
        <MenuIcon aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="top"
        variant="floating"
        showCloseButton={false}
        className="top-14 max-h-[calc(100dvh-4rem)] lg:hidden"
      >
        <div className="flex items-center justify-between px-4 pt-3">
          <SheetTitle className="text-sm font-medium">{m.home_page__nav_menu()}</SheetTitle>
          <SheetCloseTrigger
            aria-label={m.home_page__nav_close()}
            render={<Button size="icon-sm" variant="ghost" radius="full" />}
          >
            <XIcon aria-hidden="true" />
          </SheetCloseTrigger>
        </div>
        <div className="min-h-0 overflow-y-auto px-4 pb-4">
          <Accordion>
            {sections.map(({ id, title, items }) => (
              <AccordionItem key={id} value={id} className="border-0">
                <AccordionTrigger
                  indicatorType="chevron"
                  className="rounded-lg px-2 py-3 text-base focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {title}
                </AccordionTrigger>
                <AccordionContent className="px-2">
                  <div className="grid gap-1">
                    {items.map((item) => (
                      <NavLinkItem
                        key={item.label}
                        className="rounded-lg px-2 py-1.5 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={close}
                        {...item}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <NavLinkItem
            href={repositoryUrl}
            label={m.navbar__source()}
            onClick={close}
            className="w-full rounded-lg px-2 py-3 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring [&_span:first-child]:text-base"
          />
          {showGuestActions && (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-4">
              <Button
                className="w-full"
                radius="full"
                size="sm"
                variant="outline"
                nativeLink
                render={<Link to="/sign-in" onClick={close} />}
              >
                {m.auth__sign_in_link()}
              </Button>
              <Button
                className="w-full"
                radius="full"
                size="sm"
                nativeLink
                render={<Link to="/sign-in" onClick={close} />}
              >
                {m.navbar__get_started()}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
