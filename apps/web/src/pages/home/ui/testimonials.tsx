import { m } from "@tsu-stack/i18n/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@tsu-stack/ui/components/avatar";
import { Marquee } from "@tsu-stack/ui/components/marquee";

import { sampleRows } from "@/pages/home/config/testimonials.config";

import { SectionHeading } from "./section-heading";

export function TestimonialsSection() {
  return (
    <section id="testimonials" aria-labelledby="home-testimonials-title" className="scroll-mt-20">
      <div className="mx-auto mb-9 max-w-2xl text-center sm:mb-12">
        <SectionHeading
          id="home-testimonials-title"
          primary={m.home_page__testimonials_title()}
          secondary={m.home_page__testimonials_subtitle()}
        />
      </div>
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
                    <span className="truncate text-sm font-medium tracking-tight">{role()}</span>
                  </figcaption>
                  <blockquote className="mt-auto line-clamp-3 text-[15px] leading-6 text-muted-foreground">
                    {quote()}
                  </blockquote>
                </figure>
              ))}
            </div>
          </Marquee>
        ))}
      </div>
    </section>
  );
}
