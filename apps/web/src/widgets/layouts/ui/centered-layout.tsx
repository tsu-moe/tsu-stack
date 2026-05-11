import { cn } from "@tsu-stack/ui/lib/utils";

import { Footer } from "@/features/footer";
import { Navbar } from "@/features/navbar";

export function CenteredLayout({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <div className={cn("flex min-h-screen flex-col", className)}>
        <Navbar />
        <main className="relative -top-(--navbar-height) grid flex-1 place-items-center pt-(--navbar-height)">
          {children}
        </main>
      </div>
      <Footer className="max-lg:mt-12" />
    </>
  );
}
