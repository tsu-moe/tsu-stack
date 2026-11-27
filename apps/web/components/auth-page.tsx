import { Avatar, AvatarFallback, AvatarImage } from "@tsu-stack/ui/components/avatar";
import { cn } from "@tsu-stack/ui/lib/utils";

import { Auth } from "@/shared/ui/auth";

type GridCell = { h: number; dim?: true };

const GRID: (GridCell | "testimonial")[][] = [
  [{ h: 44 }, { h: 50, dim: true }, { h: 44 }, { h: 50, dim: true }, { h: 44 }, { h: 44 }],
  [{ h: 30 }, "testimonial", { h: 44 }, { h: 60 }, { h: 36 }, { h: 36 }, { h: 36 }],
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
            <h2 className="font-heading text-3xl font-bold text-balance">Ready to join Efferd?</h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Join thousands of teams shipping beautiful, production-ready interfaces in record time.
            </p>
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
                    cell === "testimonial" ? (
                      <TestimonialCard key={j} />
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

function TestimonialCard() {
  return (
    <figure
      className={cn(
        "break-inside-avoid rounded-xl border bg-background px-6 py-8 shadow-xs",
        "dark:bg-[radial-gradient(50%_80%_at_5%_0%,--theme(--color-foreground/.08),transparent)]",
        "bg-clip-border before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-xl)-1px)] before:shadow-[0_-1px_--theme(--color-foreground/8%)]"
      )}
    >
      <div className="mb-8">
        <img
          alt="Vercel Logo"
          className="pointer-events-none h-4.5 w-fit select-none dark:brightness-0 dark:invert"
          height="auto"
          loading="lazy"
          src="https://storage.efferd.com/logo/vercel-wordmark.svg"
          width="auto"
        />
      </div>
      <blockquote className="text-xl leading-tight">
        &quot;<span className="font-medium">Efferd</span> is why I still have hair. No more worrying about UI
        blocks.&quot;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <Avatar className="rounded-full border object-cover">
          <AvatarImage alt="Guillermo Rauch's profile picture" src="https://github.com/rauchg.png" />
          <AvatarFallback>GR</AvatarFallback>
        </Avatar>
        <div className="space-y-0.5">
          <cite className="text-sm font-medium text-foreground not-italic">Guillermo Rauch</cite>
          <div className="text-xs text-muted-foreground">CEO, Vercel</div>
        </div>
      </figcaption>
    </figure>
  );
}
