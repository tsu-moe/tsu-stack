"use client";

import { useEffect, useId, useRef, useState } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@tsu-stack/ui/components/accordion";
import { Button } from "@tsu-stack/ui/components/button";
import { cn } from "@tsu-stack/ui/lib/utils";

import { getHomeNavigation } from "@/widgets/site-layout/config/nav-links.config";

import { NavLinkItem } from "./nav-link-item";

export function MobileNav({ showGuestActions }: { showGuestActions: boolean }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const { application, foundations, guides, project, setup, releases, directLinks } = getHomeNavigation();
  const sections = [
    { id: "stack", title: m.navbar__stack(), items: [setup, ...application, ...foundations] },
    { id: "resources", title: m.navbar__resources(), items: [releases, ...guides, ...project] }
  ];
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target;
      if (!(target instanceof Node) || (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target))) {
        return;
      }
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    desktop.addEventListener("change", closeOnDesktop);
    document.addEventListener("keydown", handleEscape);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <>
      <Button
        ref={triggerRef}
        aria-controls={menuId}
        aria-expanded={open}
        aria-label={open ? m.home_page__nav_close() : m.navbar__toggle_menu()}
        className="lg:hidden"
        size="icon"
        variant="ghost"
        onClick={() => setOpen((value) => !value)}
      >
        <MenuGlyph open={open} />
      </Button>
      <nav
        ref={menuRef}
        id={menuId}
        aria-label={m.home_page__nav_menu()}
        className="fixed inset-x-0 top-14 bottom-0 overflow-y-auto overscroll-contain bg-background lg:hidden"
        data-slot="mobile-site-nav"
        hidden={!open}
      >
        {open && (
          <div className="home-container py-4 motion-safe:animate-in motion-safe:duration-200 motion-safe:zoom-in-95">
            <Accordion className="w-full">
              {sections.map(({ id, title, items }) => (
                <AccordionItem key={id} value={id} className="border-0">
                  <AccordionTrigger
                    indicatorType="chevron"
                    className="rounded-md px-4 py-2 text-lg text-muted-foreground hover:no-underline"
                  >
                    {title}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-2">
                    <div className="grid gap-1">
                      {items.map(({ href, icon, label }) => (
                        <NavLinkItem key={href} href={href} icon={icon} label={label} onClick={close} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {directLinks.map(({ href, label }) => (
              <NavLinkItem key={href} href={href} label={label} onClick={close} className="px-4 py-2 text-lg" />
            ))}
            {showGuestActions && (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button className="w-full" variant="outline" nativeLink render={<Link to="/sign-in" onClick={close} />}>
                  {m.auth__sign_in_link()}
                </Button>
                <Button className="w-full" nativeLink render={<Link to="/sign-in" onClick={close} />}>
                  {m.navbar__get_started()}
                </Button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative size-4">
      <span
        className={cn(
          "absolute start-0 block h-0.5 w-full bg-current motion-safe:transition-all motion-safe:duration-200",
          open ? "top-[0.4rem] rotate-45" : "top-1"
        )}
      />
      <span
        className={cn(
          "absolute start-0 block h-0.5 w-full bg-current motion-safe:transition-all motion-safe:duration-200",
          open ? "top-[0.4rem] -rotate-45" : "top-2.5"
        )}
      />
    </span>
  );
}
