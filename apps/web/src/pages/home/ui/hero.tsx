import { ArrowRightIcon, ZapIcon } from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";

import { DashboardPreview } from "@/shared/ui/dashboard-preview";
import { repositoryUrl } from "@/shared/ui/nav-links";

export function HeroSection() {
  return (
    <section aria-labelledby="home-hero-title" className="pt-14 sm:pt-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        <Button
          radius="full"
          size="sm"
          variant="outline"
          nativeLink
          render={
            <a href="#stack">
              <ZapIcon data-icon="inline-start" aria-hidden="true" />
              {m.home_page__hero_badge()}
            </a>
          }
        />
        <h1
          id="home-hero-title"
          className="font-heading max-w-2xl text-4xl font-semibold tracking-tighter text-balance sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {m.home_page__hero_title()}
        </h1>
        <p className="max-w-xl text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
          {m.home_page__hero_description()}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button radius="full" size="lg" nativeLink render={<Link to="/sign-in" />}>
            {m.navbar__get_started()}
            <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Button>
          <Button radius="full" size="lg" variant="outline" nativeLink render={<Link href={repositoryUrl} />}>
            {m.home_page__hero_cta()}
          </Button>
        </div>
      </div>

      <div className="home-color-panel mt-12 rounded-3xl p-3 sm:mt-14 sm:p-7 lg:p-10">
        <DashboardPreview alt={m.home_page__hero_dashboard_preview()} priority />
      </div>
    </section>
  );
}
