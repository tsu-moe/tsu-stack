import { m } from "@tsu-stack/i18n/messages";
import { Marquee } from "@tsu-stack/ui/components/marquee";

import { wordmarks } from "@/pages/home/config/stack-logos.config";

export function StackLogosSection() {
  return (
    <section id="stack" aria-labelledby="home-stack-title" className="scroll-mt-24 py-12 sm:py-16">
      <h2 id="home-stack-title" className="text-center text-sm font-medium text-muted-foreground">
        {m.home_page__stack_heading()}
      </h2>
      <Marquee
        className="mt-4 sm:mt-6"
        data-home-marquee=""
        gap="clamp(1.25rem, 4vw, 3rem)"
        onlyOnOverflow={false}
        pauseOnHover
        speed={36}
      >
        <ul className="flex items-center gap-[var(--marquee-gap)] py-2 [--stack-logo-size:2.5rem] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-5 sm:[--stack-logo-size:2.875rem]">
          {wordmarks.map(({ name, light, dark, width, height, widthScale, offsetY }) => (
            <li
              key={name}
              className="shrink-0"
              style={{ width: `calc(var(--stack-logo-size) * ${widthScale})`, translate: `0 ${offsetY}%` }}
            >
              <img alt={name} src={light} width={width} height={height} className="h-auto w-full dark:hidden" />
              <img alt={name} src={dark} width={width} height={height} className="hidden h-auto w-full dark:block" />
            </li>
          ))}
        </ul>
      </Marquee>
    </section>
  );
}
