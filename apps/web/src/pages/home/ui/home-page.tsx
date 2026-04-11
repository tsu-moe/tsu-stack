import { CallToAction } from "./call-to-action";
import { HeroSection } from "./hero-section";
import { IntegrationsSection } from "./integrations-section";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <IntegrationsSection />
      <CallToAction />
    </>
  );
}
