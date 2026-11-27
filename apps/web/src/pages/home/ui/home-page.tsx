import { SiteLayout } from "@/widgets/site-layout";

import { FaqSection } from "./faq";
import { HeroSection } from "./hero";
import { RequestPathSection } from "./request-path";
import { StackLogosSection } from "./stack-logos";
import { StartSection } from "./start";
import { TestimonialsSection } from "./testimonials";

export function HomePage() {
  return (
    <SiteLayout>
      <HeroSection />
      <StackLogosSection />
      <RequestPathSection />
      <TestimonialsSection />
      <FaqSection />
      <StartSection />
    </SiteLayout>
  );
}
