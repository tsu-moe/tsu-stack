import { SparklesIcon, ArrowRightIcon, PlayIcon } from "lucide-react";

import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { cn } from "@tsu-stack/ui/lib/utils";

import { FullWidthDivider } from "@/shared/ui/full-width-divider";

export function HeroSection() {
  return (
    <section className="relative w-full border-b px-4 pt-36 pb-54">
      {/*  Shades */}
      <div aria-hidden="true" className="absolute inset-0 isolate hidden overflow-hidden contain-strict lg:block">
        <div className="absolute inset-0 isolate -z-10 bg-[radial-gradient(35%_80%_at_49%_45%,--theme(--color-foreground/.05),transparent)] contain-strict" />
      </div>

      {/*  main content */}
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center justify-center gap-5">
        <a
          className={cn(
            "group flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1.5 shadow-xs active:scale-98"
          )}
          href="#link"
        >
          <SparklesIcon className="size-3" />
          <span className="block h-4 border-l" />

          <span className="text-xs">Now Support AI</span>
          <span className="block h-4 border-l" />

          <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
        </a>

        <h1
          className={cn(
            "font-heading text-center text-4xl tracking-tight text-balance md:text-5xl lg:text-6xl",
            "text-shadow-[0_0px_50px_theme(--color-foreground/.2)]"
          )}
        >
          Plan and navigate from idea to launch
        </h1>

        <p className={cn("mx-auto max-w-lg text-center text-sm tracking-wider text-foreground/80 sm:text-lg")}>
          Create roadmap, track progress, and guide your project from idea to successful launch.
        </p>

        <div className={cn("flex flex-row flex-wrap items-center justify-center gap-3 pt-2")}>
          <Button className="rounded-full border bg-card shadow-xs active:scale-98" size="lg" variant="ghost">
            <PlayIcon data-icon="inline-start" /> Watch Demo
          </Button>
          <Button
            className="rounded-full active:scale-98"
            size="lg"
            render={<Link to="/sign-in" />}
            nativeButton={false}
          >
            Get Started <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
      <GradientBars />
      <FullWidthDivider className="-bottom-px" />
    </section>
  );
}

function GradientBars() {
  const numBars = 15;

  const calculateHeight = (index: number, total: number) => {
    const position = index / (total - 1);
    const maxHeight = 100;
    const minHeight = 30;

    const center = 0.5;
    const distanceFromCenter = Math.abs(position - center);
    const heightPercentage = (distanceFromCenter * 2) ** 1.2;

    return minHeight + (maxHeight - minHeight) * heightPercentage;
  };

  return (
    <div className="absolute inset-x-0 inset-y-1/3 bottom-0 z-0 overflow-hidden">
      <div
        className="flex size-full"
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitFontSmoothing: "antialiased"
        }}
      >
        {Array.from({ length: numBars }).map((_, index) => {
          const height = calculateHeight(index, numBars);
          return (
            <div
              className={cn(
                "h-full origin-bottom rounded-t-md border-x-[0.5px] first:border-l-0 last:border-r-0",
                "dark:bg-linear-[to_top,theme(--color-primary/.9),transparent]",
                "animate-in duration-2000 fill-mode-backwards slide-in-from-bottom-1/2"
              )}
              key={`${numBars}-line-${index}`}
              style={{
                flex: "1 0 calc(100% / 15)",
                maxWidth: "calc(100% / 15)",
                transform: `scaleY(${height / 100})`
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
