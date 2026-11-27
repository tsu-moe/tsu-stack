import { m } from "@tsu-stack/i18n/messages";
import { Avatar } from "@tsu-stack/ui/components/avatar";
import { cn } from "@tsu-stack/ui/lib/utils";

import { Auth } from "@/shared/ui/auth";
import { Logo, LogoIcon } from "@/shared/ui/logo";

import { appConfig } from "@/config/app.config";

type GridCell = { h: number; dim?: true };

const GRID: (GridCell | "promo")[][] = [
  [{ h: 44 }, { h: 50, dim: true }, { h: 44 }, { h: 50, dim: true }, { h: 44 }, { h: 44 }],
  [{ h: 30 }, "promo", { h: 44 }, { h: 60 }, { h: 36 }, { h: 36 }, { h: 36 }],
  [{ h: 50 }, { h: 44, dim: true }, { h: 60 }, { h: 44, dim: true }, { h: 44, dim: true }, { h: 44 }]
];

export function AuthPage({ onContinueEmail }: { onContinueEmail: (email: string) => void }) {
  return (
    <div className="h-dvh overflow-hidden">
      <div className="relative grid h-full md:grid-cols-2 lg:grid-cols-[1fr_0.55fr]">
        <div className="h-full place-content-center p-8">
          <Auth onContinueEmail={onContinueEmail} />
        </div>
        <div className="hidden size-full flex-col overflow-hidden border-l md:flex">
          <div className="px-10 pt-16 pb-8 text-center">
            <h2 className="font-heading text-3xl font-bold text-balance">
              {m.auth__promo_title({ siteName: appConfig.site.shortName })}
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">{m.auth__promo_description()}</p>
          </div>
          <div className="relative size-full border mask-t-from-90% mask-x-from-92% mask-b-from-95%">
            <div
              className={cn(
                "absolute inset-x-[-50%] grid grid-cols-3 gap-4 overflow-hidden",
                "*:size-full *:space-y-4"
              )}
            >
              {GRID.map((col, i) => (
                <div
                  className="animate-in duration-700 fill-mode-backwards fade-in slide-in-from-bottom-12"
                  key={i}
                  style={{ animationDelay: `${100 + i * 120}ms` }}
                >
                  {col.map((cell, j) =>
                    cell === "promo" ? (
                      <PromoCard key={j} />
                    ) : (
                      <div
                        className={cn("rounded-xl", cell.dim ? "bg-foreground/2" : "bg-foreground/4")}
                        key={j}
                        style={{ height: `calc(var(--spacing) * ${cell.h})` }}
                      />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromoCard() {
  return (
    <figure
      className={cn(
        "break-inside-avoid rounded-xl border bg-background px-6 py-8 shadow-xs",
        "dark:bg-[radial-gradient(50%_80%_at_5%_0%,--theme(--color-foreground/.08),transparent)]",
        "bg-clip-border before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-xl)-1px)] before:shadow-[0_-1px_--theme(--color-foreground/8%)]"
      )}
    >
      <div className="mb-8">
        <Logo className="h-4.5" />
      </div>
      <p className="text-xl leading-tight">{m.auth__promo_note()}</p>
      <figcaption className="mt-6 flex items-center gap-3">
        <Avatar className="rounded-full border object-cover">
          <LogoIcon aria-hidden="true" className="m-auto size-3.5" />
        </Avatar>
        <div className="space-y-0.5">
          <div className="text-sm font-medium text-foreground">{appConfig.site.shortName}</div>
          <div className="text-xs text-muted-foreground">{m.auth__promo_caption()}</div>
        </div>
      </figcaption>
    </figure>
  );
}
