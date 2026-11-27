"use client";

import { ArrowUpRightIcon } from "lucide-react";
import React from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { cn } from "@tsu-stack/ui/lib/utils";

import { getHomeNavigation, repositoryUrl } from "@/shared/ui/nav-links";
import { Portal, PortalBackdrop } from "@/shared/ui/portal";
import { LinkItem } from "@/shared/ui/sheard";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const { stack, resources, moreResources } = getHomeNavigation();

  return (
    <div className="md:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label={m.navbar__toggle_menu()}
        className="rounded-full"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="ghost"
      >
        <div className="relative size-4">
          <span
            className={cn(
              "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-200",
              open ? "top-[0.4rem] -rotate-45" : "top-1"
            )}
          />
          <span
            className={cn(
              "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-200",
              open ? "top-[0.4rem] rotate-45" : "top-2.5"
            )}
          />
        </div>
      </Button>
      {open && (
        <Portal className="top-14 flex flex-col">
          <PortalBackdrop />
          <div
            className={cn(
              "flex flex-col gap-y-2 overflow-y-auto px-6 py-4",
              "mask-t-from-95% mask-b-from-95%",
              "ease-out data-[slot=open]:animate-in data-[slot=open]:zoom-in-95"
            )}
            data-slot={open ? "open" : "closed"}
          >
            <LinkItem
              className="rounded-2xl px-4 py-3 active:bg-muted dark:active:bg-muted/50"
              href={repositoryUrl}
              label={m.navbar__source()}
            />

            <span className="text-sm">{m.navbar__stack()}</span>
            {stack.map((link) => (
              <LinkItem
                className="rounded-2xl p-2 active:bg-muted dark:active:bg-muted/50"
                key={link.label}
                onClick={() => setOpen(false)}
                {...link}
              />
            ))}
            <span className="text-sm">{m.navbar__resources()}</span>
            {resources.map((link) => (
              <LinkItem
                className="rounded-2xl p-2 active:bg-muted dark:active:bg-muted/50"
                key={link.label}
                onClick={() => setOpen(false)}
                {...link}
              />
            ))}
            {moreResources.map((link) => (
              <LinkItem
                className="rounded-2xl p-2 active:bg-muted dark:active:bg-muted/50"
                key={link.label}
                onClick={() => setOpen(false)}
                {...link}
              />
            ))}
          </div>
          <div className="z-50 mt-auto grid grid-cols-2 gap-2 border-t bg-background px-4 py-2">
            <Button variant="outline" render={<Link to="/sign-in" />} nativeButton={false}>
              {m.auth__sign_in_link()}
            </Button>
            <Button render={<Link to="/sign-in" />} nativeButton={false}>
              {m.navbar__get_started()}
              <ArrowUpRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </Portal>
      )}
    </div>
  );
}
