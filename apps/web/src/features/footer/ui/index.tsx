import { type ComponentProps } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { Separator } from "@tsu-stack/ui/components/separator";
import { cn } from "@tsu-stack/ui/lib/utils";

import { GithubIcon } from "@/shared/ui/github-icon";
import { Logo } from "@/shared/ui/logo";
import { HomeNavigationLink, repositoryUrl, scaffoldingUrl } from "@/shared/ui/nav-links";

import { appConfig } from "@/config/app.config";

const authorProfileUrl = "https://github.com/tsu-moe";
const footerLinkClass =
  "w-fit rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring";

export function Footer({ className, ...props }: ComponentProps<"footer">) {
  const resources = [
    { label: m.navbar__source(), href: repositoryUrl },
    { label: m.navbar__cli(), href: scaffoldingUrl },
    { label: m.navbar__issues(), href: `${repositoryUrl}/issues` },
    { label: m.navbar__releases(), href: `${repositoryUrl}/releases` }
  ];

  return (
    <footer className={cn("border-t bg-background", className)} {...props}>
      <div className="home-container pt-12 pb-7 lg:pt-16">
        <div className="grid gap-9 lg:grid-cols-[1fr_2fr] lg:gap-12">
          <div>
            <Link to="/" className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
              <Logo className="h-6 text-xl" />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {m.home_page__footer_tagline()}
            </p>
          </div>
          <nav aria-label={m.footer__navigation()} className="grid grid-cols-2 gap-7 sm:grid-cols-3">
            <div>
              <h2 className="text-sm font-semibold">{m.navbar__stack()}</h2>
              <ul className="mt-4 grid gap-2.5">
                <li>
                  <HomeNavigationLink className={footerLinkClass} href="#stack">
                    {m.home_page__stack_heading()}
                  </HomeNavigationLink>
                </li>
                <li>
                  <Link className={footerLinkClass} to="/dashboard">
                    {m.footer__dashboard()}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold">{m.navbar__resources()}</h2>
              <ul className="mt-4 grid gap-2.5">
                {resources.map(({ label, href }) => (
                  <li key={href}>
                    <Link className={footerLinkClass} href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold">{m.footer__legal()}</h2>
              <ul className="mt-4 grid gap-2.5">
                <li>
                  <Link className={footerLinkClass} to="/privacy-policy">
                    {m.footer__privacy_policy()}
                  </Link>
                </li>
                <li>
                  <Link className={footerLinkClass} to="/terms-of-service">
                    {m.footer__terms_of_service()}
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <Separator className="mt-9 lg:mt-12" aria-hidden="true" />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {m.footer__built_by()}{" "}
            <Link
              className="rounded-sm font-medium text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring"
              href={authorProfileUrl}
            >
              {appConfig.site.author}
            </Link>
          </p>
          <Button
            aria-label={m.footer__github()}
            radius="full"
            size="icon-sm"
            variant="ghost"
            nativeLink
            render={<Link href={repositoryUrl} />}
          >
            <GithubIcon aria-hidden="true" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
