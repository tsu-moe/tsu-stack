import { SparklesIcon, ArrowRightIcon, PlayIcon } from "lucide-react";

import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { cn } from "@tsu-stack/ui/lib/utils";

export function HeroSection() {
  return (
    <section className="relative w-full px-4 pt-36 pb-24 md:pb-32">
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

        <h1 className="font-heading text-center text-4xl tracking-tight text-balance md:text-5xl lg:text-6xl">
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
    </section>
  );
}
