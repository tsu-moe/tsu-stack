import { Hydrate } from "@tanstack/react-start";

import { m } from "@tsu-stack/i18n/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@tsu-stack/ui/components/avatar";
import { BlurFade } from "@tsu-stack/ui/components/blur-fade";
import { Marquee } from "@tsu-stack/ui/components/marquee";

import { homeScrollReveal } from "@/pages/home/config/home-motion.config";
import { sampleRows } from "@/pages/home/config/testimonials.config";
import { useHomeWidgetHydration } from "@/pages/home/hooks/use-home-widget-hydration.hook";

import { SectionHeading } from "./section-heading";

export function TestimonialsSection() {
  const { ref, when } = useHomeWidgetHydration();

  return (
    <section id="testimonials" aria-labelledby="home-testimonials-title" className="scroll-mt-20">
      <div className="mx-auto mb-9 max-w-2xl text-center sm:mb-12">
        <SectionHeading
          id="home-testimonials-title"
          primary={m.home_page__testimonials_title()}
          secondary={m.home_page__testimonials_subtitle()}
        />
      </div>
      <BlurFade {...homeScrollReveal} ref={ref}>
        <Hydrate when={when} fallback={<div aria-hidden="true" className="h-77 sm:h-79" />}>
          <TestimonialRows />
        </Hydrate>
      </BlurFade>
    </section>
  );
}

function TestimonialRows() {
  return (
    <div className="flex flex-col gap-7 sm:gap-9">
      {sampleRows.map(({ direction, testimonials }) => (
        <Marquee
          key={direction}
          data-home-marquee=""
          direction={direction}
          gap={24}
          onlyOnOverflow={false}
          pauseOnHover
          speed={34}
        >
          <div className="flex gap-6 motion-reduce:grid motion-reduce:w-full sm:motion-reduce:grid-cols-2 lg:motion-reduce:grid-cols-3">
            {testimonials.map(({ initials, avatar, role, quote }) => (
              <figure
                key={initials}
                className="flex w-[min(20rem,calc(100vw-3rem))] shrink-0 flex-col gap-4 px-3 py-2 whitespace-normal motion-reduce:w-full sm:px-4"
              >
                <figcaption className="flex min-w-0 items-center gap-2.5">
                  <Avatar className="size-9" aria-hidden="true">
                    <AvatarImage src={avatar} alt="" />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 text-sm font-medium tracking-tight">{role()}</span>
                </figcaption>
                <blockquote className="mb-auto text-[15px] leading-6 text-muted-foreground">{quote()}</blockquote>
              </figure>
            ))}
          </div>
        </Marquee>
      ))}
    </div>
  );
}
