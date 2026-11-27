import { SparklesIcon, ArrowRightIcon } from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { cn } from "@tsu-stack/ui/lib/utils";

import { GithubIcon } from "@/shared/ui/github-icon";
import { repositoryUrl } from "@/shared/ui/nav-links";

export function HeroSection() {
  return (
    <section className="relative w-full px-4 pt-36 pb-24 md:pb-32">
      {/*  main content */}
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center justify-center gap-5">
        <a
          className={cn(
            "group flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1.5 shadow-xs active:scale-98"
          )}
          href="#stack"
        >
          <SparklesIcon className="size-3" />
          <span className="block h-4 border-l" />

          <span className="text-xs">{m.home_page__hero_badge()}</span>
          <span className="block h-4 border-l" />

          <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
        </a>

        <h1 className="font-heading text-center text-4xl tracking-tight text-balance md:text-5xl lg:text-6xl">
          {m.home_page__hero_title()}
        </h1>

        <p className={cn("mx-auto max-w-lg text-center text-sm tracking-wider text-foreground/80 sm:text-lg")}>
          {m.home_page__hero_description()}
        </p>

        <div className={cn("flex flex-row flex-wrap items-center justify-center gap-3 pt-2")}>
          <Button
            className="rounded-full border bg-card shadow-xs active:scale-98"
            size="lg"
            variant="ghost"
            render={<a href={repositoryUrl} />}
            nativeButton={false}
          >
            <GithubIcon data-icon="inline-start" /> {m.home_page__hero_cta()}
          </Button>
          <Button
            className="rounded-full active:scale-98"
            size="lg"
            render={<Link to="/sign-in" />}
            nativeButton={false}
          >
            {m.navbar__get_started()} <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  );
}
