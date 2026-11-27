import { UserRoundIcon } from "lucide-react";
import { useState } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { buttonVariants } from "@tsu-stack/ui/components/button";
import { cn } from "@tsu-stack/ui/lib/utils";

import { GithubIcon } from "@/shared/ui/github-icon";
import { Image } from "@/shared/ui/image";
import { Logo } from "@/shared/ui/logo";
import { repositoryUrl } from "@/shared/ui/nav-links";

import { appConfig } from "@/config/app.config";

const authorProfileUrl = "https://github.com/tsu-moe";

const footerRoutes = [
  { label: m.footer__dashboard, to: "/dashboard" },
  { label: m.footer__privacy_policy, to: "/privacy-policy" },
  { label: m.footer__terms_of_service, to: "/terms-of-service" }
] as const;

export function Footer({ className, ...props }: React.ComponentProps<"footer">) {
  const [year] = useState(() => new Date().getFullYear());
  const author = appConfig.site.author;
  const authorProfileLabel = m.footer__author_profile({ author });
  const socialLinkClass = buttonVariants({ size: "icon-sm", variant: "ghost" });

  return (
    <footer className={cn("border-t", className)} {...props}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <Logo className="h-4.5 text-lg" />
          <div className="flex items-center gap-1">
            <Link aria-label={authorProfileLabel} className={socialLinkClass} href={authorProfileUrl}>
              <UserRoundIcon aria-hidden="true" />
            </Link>
            <Link aria-label={m.footer__github()} className={socialLinkClass} href={repositoryUrl}>
              <GithubIcon aria-hidden="true" />
            </Link>
          </div>
        </div>

        <nav aria-label={m.footer__navigation()}>
          <ul className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground md:gap-6">
            <li>
              <Link className="hover:text-foreground" href={repositoryUrl}>
                {m.navbar__source()}
              </Link>
            </li>
            {footerRoutes.map(({ label, to }) => (
              <li key={to}>
                <Link className="hover:text-foreground" to={to}>
                  {label()}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 border-t px-4 py-6 text-sm text-muted-foreground">
        <p>
          &copy; {year} {author}
        </p>
        <p className="inline-flex items-center gap-1">
          <span>{m.footer__built_by()}</span>
          <Link
            className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground hover:underline"
            href={authorProfileUrl}
          >
            <Image width={32} height={32} alt="" className="size-4 rounded-full" src={`${authorProfileUrl}.png`} />
            {author}
          </Link>
        </p>
      </div>
    </footer>
  );
}
