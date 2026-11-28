import { type ComponentProps } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { Image } from "@tsu-stack/ui/components/image";
import { Separator } from "@tsu-stack/ui/components/separator";
import { cn } from "@tsu-stack/ui/lib/utils";

import { GithubIcon } from "@/shared/assets/icons/github-icon";
import { repositoryUrl } from "@/shared/config/project-links";
import { Logo } from "@/shared/ui/logo";

import {
  authorProfileUrl,
  getFooterExploreLinks,
  getFooterProjectLinks
} from "@/widgets/site-layout/config/footer-links.config";

import { appConfig } from "@/config/app.config";

import { HomeNavigationLink } from "./home-navigation-link";

const footerLinkClass =
  "w-fit rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring";

export function Footer({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer className={cn("border-t bg-background", className)} {...props}>
      <div className="home-container pt-14">
        <div className="grid gap-10 pb-12 md:grid-cols-[minmax(12rem,1fr)_minmax(0,2fr)] md:gap-12 lg:gap-20 lg:pb-16">
          <div>
            <Link to="/" className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
              <Logo className="h-6 text-xl" />
            </Link>
            <p className="mt-5 max-w-56 text-sm leading-6 text-muted-foreground">{m.home_page__footer_tagline()}</p>
          </div>
          <nav aria-label={m.footer__navigation()} className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h2 className="text-sm font-medium">{m.footer__explore()}</h2>
              <ul className="mt-4 grid gap-2.5">
                {getFooterExploreLinks().map(({ label, href }) => (
                  <li key={href}>
                    <HomeNavigationLink className={footerLinkClass} href={href}>
                      {label}
                    </HomeNavigationLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-medium">{m.home_page__nav_project()}</h2>
              <ul className="mt-4 grid gap-2.5">
                {getFooterProjectLinks().map(({ label, href }) => (
                  <li key={href}>
                    <Link className={footerLinkClass} href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-medium">{m.footer__legal()}</h2>
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
        <Separator aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-between gap-4 py-5">
          <p className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
            <span>{m.footer__built_by()}</span>
            <Link
              className="inline-flex items-center gap-1 rounded-sm font-medium text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring"
              href={authorProfileUrl}
            >
              <Image width={32} height={32} alt="" className="size-4 rounded-full" src={`${authorProfileUrl}.png`} />
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
