import { m } from "@tsu-stack/i18n/messages";
import { Marquee } from "@tsu-stack/ui/components/marquee";
import { cn } from "@tsu-stack/ui/lib/utils";

import betterAuthDark from "./stack-assets/better-auth-wordmark-dark.svg";
import betterAuthLight from "./stack-assets/better-auth-wordmark-light.svg";
import drizzleDark from "./stack-assets/drizzle-wordmark-dark.svg";
import drizzleLight from "./stack-assets/drizzle-wordmark-light.svg";
import postgresqlDark from "./stack-assets/postgresql-wordmark-dark.svg";
import postgresqlLight from "./stack-assets/postgresql-wordmark-light.svg";
import tanstackDark from "./stack-assets/tanstack-wordmark-dark.svg";
import tanstackLight from "./stack-assets/tanstack-wordmark-light.svg";
import typescriptDark from "./stack-assets/typescript-wordmark-dark.svg";
import typescriptLight from "./stack-assets/typescript-wordmark-light.svg";
import vitePlusDark from "./stack-assets/vite-plus-dark.svg";
import vitePlusLight from "./stack-assets/vite-plus-light.svg";

const wordmarks = [
  { name: "Vite+", light: vitePlusLight, dark: vitePlusDark, width: 103, height: 15 },
  { name: "TypeScript", light: typescriptLight, dark: typescriptDark, width: 100, height: 29 },
  { name: "TanStack", light: tanstackLight, dark: tanstackDark, width: 321, height: 50 },
  { name: "Drizzle", light: drizzleLight, dark: drizzleDark, width: 255, height: 48 },
  { name: "PostgreSQL", light: postgresqlLight, dark: postgresqlDark, width: 144, height: 26, className: "max-w-32" },
  { name: "Better Auth", light: betterAuthLight, dark: betterAuthDark, width: 400, height: 52, className: "max-w-32" }
];

export function StackLogosSection() {
  return (
    <section id="stack" aria-labelledby="home-stack-title" className="scroll-mt-24 py-12 sm:py-16">
      <h2 id="home-stack-title" className="text-center text-sm font-medium text-muted-foreground">
        {m.home_page__stack_heading()}
      </h2>
      <Marquee
        className="mt-4 sm:mt-6"
        data-home-marquee=""
        gap="clamp(1.25rem, 4vw, 3rem)"
        onlyOnOverflow={false}
        pauseOnHover
        speed={36}
      >
        <ul className="flex items-center gap-[var(--marquee-gap)] py-2 motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-5">
          {wordmarks.map(({ name, light, dark, width, height, className }) => (
            <li key={name} className={cn("shrink-0", className ?? "max-w-44 sm:max-w-48")}>
              <img
                alt={name}
                src={light}
                width={width}
                height={height}
                className="h-7 w-auto max-w-full object-contain sm:h-8 dark:hidden"
              />
              <img
                alt={name}
                src={dark}
                width={width}
                height={height}
                className="hidden h-7 w-auto max-w-full object-contain sm:h-8 dark:block"
              />
            </li>
          ))}
        </ul>
      </Marquee>
    </section>
  );
}
