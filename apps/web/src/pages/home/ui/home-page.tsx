import { SiteLayout } from "@/widgets/site-layout";

import { FaqSection } from "./faq";
import { HeroSection } from "./hero";
import { SetupSection } from "./setup";
import { StackLogosSection } from "./stack-logos";
import { StartSection } from "./start";
import { TestimonialsSection } from "./testimonials";

export function HomePage() {
  return (
    <SiteLayout>
      <div className="flex flex-col gap-38 pb-38 sm:gap-52 sm:pb-44">
        <div>
          <HeroSection />
          <StackLogosSection />
        </div>
        <SetupSection />
        <TestimonialsSection />
        <FaqSection />
        <StartSection />
      </div>
    </SiteLayout>
  );
}
