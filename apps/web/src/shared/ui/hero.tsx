import { ArrowRightIcon } from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { cn } from "@tsu-stack/ui/lib/utils";

import { GridDivider, HorizontalDivider } from "@/shared/ui/dividers";
import { repositoryUrl } from "@/shared/ui/nav-links";

export function HeroSection() {
  return (
    <section className="relative flex flex-1 flex-col">
      <div className="relative isolate flex flex-col items-center justify-center px-4 pt-24 pb-16 sm:px-8">
        <div className={cn("z-10 flex w-full flex-col items-center justify-center gap-5 px-4")}>
          <a
            className={cn(
              "group relative flex w-fit items-center gap-2 py-2",
              "transition-all delay-500 duration-500 ease-out fill-mode-backwards slide-in-from-bottom-10 fade-in motion-safe:animate-in"
            )}
            href="#stack"
          >
            <div className="absolute inset-x-[-20%] top-px h-px bg-border mask-x-from-80%" />
            <div className="absolute inset-x-[-20%] bottom-px h-px bg-border mask-x-from-80%" />

            <div className="rounded-sm border bg-card px-1.5 py-0.5 shadow-sm">
              <p className="font-mono text-xs">{m.home_page__hero_tag()}</p>
            </div>

            <span className="text-xs font-medium">{m.home_page__hero_badge()}</span>
            <span className="block h-5 border-l" />

            <div className="pr-1">
              <ArrowRightIcon className="size-3 -translate-x-0.5 duration-150 ease-out group-hover:translate-x-0" />
            </div>
          </a>

          <h1
            className={cn(
              "font-heading max-w-3xl text-center text-2xl font-medium tracking-tight text-balance text-foreground sm:text-4xl md:text-5xl lg:text-6xl",
              "delay-100 duration-500 ease-out fill-mode-backwards slide-in-from-bottom-10 fade-in motion-safe:animate-in"
            )}
          >
            {m.home_page__hero_title()}
          </h1>

          <p
            className={cn(
              "max-w-sm text-center text-sm tracking-wider text-muted-foreground sm:text-base",
              "delay-200 duration-500 ease-out fill-mode-backwards slide-in-from-bottom-10 fade-in motion-safe:animate-in"
            )}
          >
            {m.home_page__hero_description()}
          </p>

          <div className="flex w-fit items-center justify-center gap-3 pt-2 delay-300 duration-500 ease-out fill-mode-backwards slide-in-from-bottom-10 fade-in motion-safe:animate-in">
            <Button render={<Link href={repositoryUrl} />} nativeButton={false} variant="ghost">
              {m.home_page__hero_cta()}
            </Button>
            <Button render={<Link to="/sign-in" />} nativeButton={false}>
              {m.navbar__get_started()} <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <GridDivider className="*:mask-t-from-75%" />
      </div>
      <HorizontalDivider />
      <div className="relative bg-background p-2">
        <div
          className={cn(
            "relative size-full overflow-hidden rounded-md ring-[0.5px] ring-foreground/10",
            "*:pointer-events-none *:aspect-video *:rounded-md *:object-cover *:select-none"
          )}
        >
          <img
            alt={m.home_page__hero_dashboard_preview()}
            className="z-2 dark:hidden"
            height="1080"
            src="https://storage.efferd.com/screen/dashboard-light.webp"
            width="1920"
          />
          <img
            alt={m.home_page__hero_dashboard_preview()}
            className="hidden dark:block"
            height="1080"
            src="https://storage.efferd.com/screen/dashboard-dark.webp"
            width="1920"
          />
        </div>
      </div>
      <HorizontalDivider />
    </section>
  );
}
