"use client";
import { DesktopNav } from "@web-components/desktop-nav";
import { ArrowUpRightIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { useScroll } from "@tsu-stack/ui/hooks/use-scroll";
import { cn } from "@tsu-stack/ui/lib/utils";

import { Logo } from "@/shared/ui/logo";
import { MobileNav } from "@/shared/ui/mobile-nav";

import { appConfig } from "@/config/app.config";

const ANIMATION_CONFIG = {
  scrolled: {
    borderRadius: "999px",
    maxWidth: "58rem",
    top: 12,
    width: "90%",
    paddingInline: "0.5rem",
    height: "3rem"
  },
  default: {
    borderRadius: "0px",
    maxWidth: "64rem",
    paddingInline: "1rem",
    top: 0,
    width: "100%",
    height: "3.5rem"
  },
  spring: {
    type: "spring" as const,
    stiffness: 200,
    damping: 20,
    mass: 0.6
  },
  reduced: {
    duration: 0
  }
} as const;

export function Header() {
  const scrolled = useScroll(20);
  const prefersReducedMotion = useReducedMotion();

  let animationProps = {};
  if (!prefersReducedMotion) {
    animationProps = scrolled ? ANIMATION_CONFIG.scrolled : ANIMATION_CONFIG.default;
  }

  const transitionProps = prefersReducedMotion ? ANIMATION_CONFIG.reduced : ANIMATION_CONFIG.spring;

  return (
    <motion.header
      animate={animationProps}
      className={cn(
        "sticky top-0 z-50 mx-auto flex w-full max-w-5xl items-center justify-between border-b md:px-2",
        "bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/60",
        scrolled && "border shadow-xs"
      )}
      initial={false}
      transition={transitionProps}
    >
      {/* Logo and Navigation Section */}
      <div className="flex h-9 items-center gap-2">
        <Link
          aria-label={m.navbar__home({ siteName: appConfig.site.shortName })}
          className="flex h-9 cursor-pointer items-center justify-center rounded-full px-4 hover:bg-muted dark:hover:bg-muted/50"
          to="/"
        >
          <Logo className="h-4" />
        </Link>

        {/* Divider - visible on desktop */}
        <div aria-hidden="true" className="h-6 shrink-0 bg-border md:w-px" />

        <DesktopNav />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* CTA Buttons - visible on desktop */}
      <div className="hidden items-center gap-2 md:flex">
        <Button className="rounded-full" variant="outline" render={<Link to="/sign-in" />} nativeButton={false}>
          {m.auth__sign_in_link()}
        </Button>
        <Button className="group rounded-full" render={<Link to="/sign-in" />} nativeButton={false}>
          {m.navbar__get_started()}
          <ArrowUpRightIcon
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-px"
            data-icon="inline-end"
          />
        </Button>
      </div>
    </motion.header>
  );
}
