import { Header } from "@/shared/ui/header";
import { HeroSection } from "@/shared/ui/hero";
import { LogosSection } from "@/shared/ui/logos-section";

export function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl border-x">
        <HeroSection />
        <LogosSection />
      </main>
    </>
  );
}
