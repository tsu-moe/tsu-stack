import { CallToAction } from "@/pages/home/ui/call-to-action";
import { HeroSection } from "@/pages/home/ui/hero-section";
import { IntegrationsSection } from "@/pages/home/ui/integrations-section";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <IntegrationsSection />
      <CallToAction />
    </>
  );
}
