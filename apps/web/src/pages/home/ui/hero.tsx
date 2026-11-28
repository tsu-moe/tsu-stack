import { ArrowRightIcon, WandSparklesIcon } from "lucide-react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";

import { GithubIcon } from "@/shared/assets/icons/github-icon";
import { repositoryUrl, scaffoldingUrl } from "@/shared/config/project-links";
import { DashboardPreview } from "@/shared/ui/dashboard-preview";
import { OglBackground } from "@/shared/ui/ogl-background";

const dashboardPreviewSizes =
  "(min-width: 72rem) 62rem, (min-width: 64rem) calc(100vw - 10rem), (min-width: 40rem) calc(100vw - 8.5rem), calc(100vw - 5rem)";

export function HeroSection() {
  return (
    <section aria-labelledby="home-hero-title" className="pt-14 sm:pt-22">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-start px-2.5 text-left sm:items-center sm:text-center">
        <Button
          className="mb-8"
          radius="full"
          size="sm"
          variant="outline"
          nativeLink
          render={
            <a href="#stack">
              <WandSparklesIcon className="size-3.5" data-icon="inline-start" aria-hidden="true" />
              {m.home_page__hero_badge()}
            </a>
          }
        />
        <h1
          id="home-hero-title"
          className="text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.04] font-medium tracking-tighter text-balance"
        >
          {m.home_page__hero_title()}
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-pretty text-muted-foreground">
          {m.home_page__hero_description()}
        </p>
        <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button
            className="w-full sm:w-auto"
            size="xl"
            radius="full"
            nativeLink
            render={<Link href={scaffoldingUrl} />}
          >
            {m.home_page__cta_documentation()}
            <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Button>
          <Button
            className="w-full sm:w-auto"
            size="xl"
            radius="full"
            variant="outline"
            nativeLink
            render={<Link href={repositoryUrl} />}
          >
            <GithubIcon data-icon="inline-start" aria-hidden="true" />
            {m.home_page__hero_cta()}
          </Button>
        </div>
      </div>

      <div className="relative isolate mt-11 overflow-hidden rounded-2xl p-3 sm:mt-14 sm:p-7 lg:p-10">
        <OglBackground reuseOnNavigation deferUntilIdle />
        <DashboardPreview alt={m.home_page__hero_dashboard_preview()} priority sizes={dashboardPreviewSizes} />
      </div>
    </section>
  );
}
