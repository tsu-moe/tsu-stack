import { Header } from "@/shared/ui/header";
import { HeroSection } from "@/shared/ui/hero";
import { LogosSection } from "@/shared/ui/logos-section";

export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <LogosSection />
      </main>
    </>
  );
}
