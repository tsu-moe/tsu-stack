import { ArrowRightIcon } from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";

import { LogoIcon } from "@/shared/assets/brand/logo-icon";
import { scaffoldingUrl } from "@/shared/config/project-links";

export function StartSection() {
  return (
    <section aria-labelledby="home-start-title" className="text-center">
      <div className="relative isolate overflow-hidden rounded-2xl bg-muted/50 px-5 py-14 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-10 grayscale">
          <LogoIcon className="absolute -start-7 -top-5 size-22 -rotate-24 sm:start-[4%] sm:-top-8 sm:size-32" />
          <LogoIcon className="absolute start-[15%] -bottom-10 hidden size-36 rotate-18 lg:block" />
          <LogoIcon className="absolute end-[22%] -top-14 hidden size-32 rotate-32 lg:block" />
          <LogoIcon className="absolute -end-8 -bottom-6 size-24 rotate-16 sm:-end-6 sm:top-[28%] sm:bottom-auto sm:size-36" />
          <LogoIcon className="absolute end-[12%] -bottom-14 hidden size-36 -rotate-12 lg:block" />
        </div>
        <h2 id="home-start-title" className="text-3xl font-medium tracking-tighter text-balance sm:text-4xl">
          {m.home_page__cta_title()}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
          {m.home_page__cta_description()}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button radius="full" size="lg" nativeLink render={<Link to="/sign-in" />}>
            {m.navbar__get_started()} <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Button>
          <Button radius="full" size="lg" variant="outline" nativeLink render={<Link href={scaffoldingUrl} />}>
            {m.home_page__cta_documentation()}
          </Button>
        </div>
      </div>
    </section>
  );
}
