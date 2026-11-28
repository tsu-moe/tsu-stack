import { type ReactNode } from "react";

import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>
        <div className="home-container">{children}</div>
      </main>
      <Footer />
    </>
  );
}
