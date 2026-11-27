import { m } from "@tsu-stack/i18n/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@tsu-stack/ui/components/avatar";
import { Marquee } from "@tsu-stack/ui/components/marquee";

import appAvatar from "./testimonial-avatars/app.webp";
import frontendAvatar from "./testimonial-avatars/frontend.webp";
import fullStackAvatar from "./testimonial-avatars/full-stack.webp";
import maintainerAvatar from "./testimonial-avatars/maintainer.webp";
import platformAvatar from "./testimonial-avatars/platform.webp";
import uiAvatar from "./testimonial-avatars/ui.webp";

const sampleRows = [
  {
    direction: "left",
    testimonials: [
      {
        initials: "FE",
        avatar: frontendAvatar,
        role: m.home_page__testimonial_frontend_role,
        quote: m.home_page__testimonial_frontend
      },
      {
        initials: "FS",
        avatar: fullStackAvatar,
        role: m.home_page__testimonial_full_stack_role,
        quote: m.home_page__testimonial_full_stack
      },
      {
        initials: "PE",
        avatar: platformAvatar,
        role: m.home_page__testimonial_platform_role,
        quote: m.home_page__testimonial_platform
      }
    ]
  },
  {
    direction: "right",
    testimonials: [
      {
        initials: "MT",
        avatar: maintainerAvatar,
        role: m.home_page__testimonial_maintainer_role,
        quote: m.home_page__testimonial_maintainer
      },
      {
        initials: "AD",
        avatar: appAvatar,
        role: m.home_page__testimonial_app_role,
        quote: m.home_page__testimonial_app
      },
      { initials: "UE", avatar: uiAvatar, role: m.home_page__testimonial_ui_role, quote: m.home_page__testimonial_ui }
    ]
  }
] as const;

export function TestimonialsSection() {
  return (
    <section id="testimonials" aria-labelledby="home-testimonials-title" className="scroll-mt-24 py-12 lg:py-16">
      <div className="mx-auto mb-8 flex max-w-2xl flex-col items-center gap-2 text-center sm:mb-10">
        <h2 id="home-testimonials-title" className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {m.home_page__testimonials_title()}
        </h2>
        <p className="text-muted-foreground">{m.home_page__testimonials_samples()}</p>
      </div>
      <div className="flex flex-col gap-3">
        {sampleRows.map(({ direction, testimonials }) => (
          <Marquee
            key={direction}
            data-home-marquee=""
            direction={direction}
            gap={12}
            onlyOnOverflow={false}
            pauseOnHover
            speed={34}
          >
            <div className="flex gap-3 motion-reduce:grid motion-reduce:w-full sm:motion-reduce:grid-cols-2 lg:motion-reduce:grid-cols-3">
              {testimonials.map(({ initials, avatar, role, quote }) => (
                <figure
                  key={initials}
                  className="flex w-[min(19rem,calc(100vw-3rem))] shrink-0 flex-col justify-between gap-5 rounded-xl px-4 py-4 whitespace-normal hover:bg-muted/60 motion-reduce:w-full sm:px-6"
                >
                  <blockquote className="text-sm leading-relaxed tracking-tight">
                    <p>{quote()}</p>
                  </blockquote>
                  <figcaption className="flex items-center gap-2.5">
                    <Avatar className="size-9" aria-hidden="true">
                      <AvatarImage src={avatar} alt="" />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{role()}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Marquee>
        ))}
      </div>
    </section>
  );
}
