import { type ReactNode } from "react";

import { Header } from "@/shared/ui/header";

import { Footer } from "@/features/footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>
        <div className="home-container">{children}</div>
      </main>
      <Footer />
    </>
  );
}
