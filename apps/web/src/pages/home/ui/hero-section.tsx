import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { Suspense, lazy } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => {
    return { default: mod.Dithering };
  }),
);

export function HeroSection() {
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <section className="flex w-full items-center justify-center">
      <div className="relative w-full">
        <div className="relative -top-(--navbar-height) flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background pt-(--navbar-height)">
          <Suspense fallback={null}>
            <div className="pointer-events-none absolute inset-0 z-0 animate-in opacity-40 mix-blend-multiply fade-in dark:opacity-60 dark:mix-blend-screen">
              <Dithering
                style={{
                  WebkitMaskComposite: "source-in",
                  maskComposite: "intersect",
                  maskImage: `
                    linear-gradient(to top, transparent 7.5%, black 25%, black 100%),
                    linear-gradient(to bottom, transparent 10%, black 25%, black 100%),
                    linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)
                  `,
                }}
                colorBack="#00000000"
                colorFront={isDark ? "#EC4E02" : "#EC4E02"}
                shape="warp"
                type="4x4"
                speed={0.2}
                className="size-full"
                minPixelRatio={1}
              />
            </div>
          </Suspense>

          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
            <div className="duraton-500 mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EC4E02] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EC4E02]" />
              </span>
              {m.home_page__hero_beta_badge()}
            </div>

            <h2 className="font-display mb-8 text-5xl leading-[1.05] font-medium tracking-tight text-foreground md:text-7xl lg:text-8xl">
              {m.home_page__hero_title_line_1()} <br />
              <span className="text-foreground">{m.home_page__hero_title_line_2()}</span>
            </h2>

            <p className="mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {m.home_page__hero_description()}
            </p>

            <Link
              className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-foreground px-12! text-base font-medium text-background transition-all duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
              href="https://github.com/tsu-moe/tsu-stack"
              target="_blank"
            >
              <span className="relative z-10">{m.home_page__hero_cta()}</span>
              <ArrowRight
                aria-hidden
                className="relative z-10 size-5.5 transition-transform duration-300"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
