import { m } from "@tsu-stack/i18n/messages";
import { Marquee } from "@tsu-stack/ui/components/marquee";

import { stackLogos } from "@/pages/home/config/stack-logos.config";

import { SectionHeading } from "./section-heading";

/**
 * Normalize icons and wordmarks together using Sanity's PINF approach.
 * https://www.sanity.io/engineering/the-logo-soup-problem
 *
 * For a new or updated mark, crop the SVG viewBox to the painted bounds and rasterize
 * it on transparency. Record the viewBox size, mean alpha coverage, and alpha-weighted
 * vertical center (0–1) in stack-logos.config.ts. The shared aspect-ratio and density
 * formula sets the widths, and the vertical offset aligns the visible artwork.
 */
export function StackLogosSection() {
  return (
    <section id="stack" aria-labelledby="home-stack-title" className="scroll-mt-20 pt-14 sm:pt-20">
      <div className="mx-auto max-w-2xl text-center">
        <SectionHeading
          id="home-stack-title"
          primary={m.home_page__stack_title()}
          secondary={m.home_page__stack_subtitle()}
        />
      </div>
      <Marquee
        className="mt-8 sm:mt-10"
        data-home-marquee=""
        gap="clamp(1.25rem, 4vw, 3rem)"
        onlyOnOverflow={false}
        pauseOnHover
        speed={36}
      >
        <ul className="flex items-center gap-[var(--marquee-gap)] py-2 [--stack-logo-size:2.5rem] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-5 sm:[--stack-logo-size:2.875rem]">
          {stackLogos.map(({ name, src, dark, width, height, widthScale, offsetY }) => (
            <li
              key={name}
              className="shrink-0"
              style={{
                width: `calc(var(--stack-logo-size) * ${widthScale})`,
                aspectRatio: `${width} / ${height}`,
                translate: `0 ${offsetY}%`
              }}
            >
              <img alt={name} src={src} className={dark ? "block size-full dark:hidden" : "block size-full"} />
              {dark && <img alt={name} src={dark} className="hidden size-full dark:block" />}
            </li>
          ))}
        </ul>
      </Marquee>
    </section>
  );
}
