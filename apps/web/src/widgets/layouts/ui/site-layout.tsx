import { type ReactNode } from "react";

import { Header } from "@/shared/ui/header";

import { useSignOutMutation } from "@/features/auth";
import { Footer } from "@/features/footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  const signOut = useSignOutMutation();

  return (
    <>
      <Header onSignOut={() => signOut.mutate()} />
      <main>
        <div className="home-container">{children}</div>
      </main>
      <Footer />
    </>
  );
}
