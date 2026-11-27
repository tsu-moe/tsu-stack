import { Header } from "@/shared/ui/header";
import { HeroSection } from "@/shared/ui/hero";
import { LogosSection } from "@/shared/ui/logos-section";

import { Footer } from "@/features/footer";

export function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl overflow-x-clip border-x">
        <HeroSection />
        <LogosSection />
      </main>
      <Footer className="lg:mt-12" />
    </>
  );
}
