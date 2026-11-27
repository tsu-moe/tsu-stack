import { useCanGoBack, useRouter } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import { type ReactNode } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { useNavigate } from "@tsu-stack/i18n/tanstack-start/hooks/use-navigate";
import { Button } from "@tsu-stack/ui/components/button";

import { FloatingPaths } from "@/shared/ui/floating-paths";
import { Logo } from "@/shared/ui/logo";

import { appConfig } from "@/config/app.config";

export function AuthPage({ children }: { children: ReactNode }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();

  function handleBack() {
    if (canGoBack) {
      router.history.back();
    } else {
      void navigate({ to: "/", replace: true });
    }
  }

  return (
    <main className="relative min-h-dvh lg:grid lg:grid-cols-2">
      <div className="relative hidden min-h-dvh flex-col overflow-hidden border-r bg-secondary p-10 lg:flex dark:bg-secondary/20">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
        <Logo className="relative z-10 mr-auto h-4.5" />

        <div className="z-10 mt-auto">
          <div className="space-y-2">
            <p className="text-xl">{m.auth__promo_note()}</p>
            <p className="font-mono text-sm font-semibold">{appConfig.site.shortName}</p>
          </div>
        </div>
        <div aria-hidden="true" className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>
      <div className="relative flex min-h-dvh flex-col justify-center px-6 py-20 sm:px-8">
        {/* Top Shades */}
        <div aria-hidden className="absolute inset-0 isolate -z-10 opacity-60 contain-strict">
          <div className="absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
          <div className="absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
          <div className="absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
        </div>
        <Button type="button" className="absolute top-7 left-5" variant="ghost" onClick={handleBack}>
          <ChevronLeftIcon data-icon="inline-start" aria-hidden="true" />
          {m.auth__back()}
        </Button>

        <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
          <Logo className="h-4.5 lg:hidden" />
          {children}
        </div>
      </div>
    </main>
  );
}
