import { FaGithub } from "react-icons/fa";

import { m } from "@tsu-stack/i18n/messages";
import { type LinkProps } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { Image } from "@tsu-stack/ui/components/image";
import { cn } from "@tsu-stack/ui/lib/utils";

import { LogoWordmark } from "@/shared/ui/logo";

import { appConfig } from "@/config/app.config";

type FooterLink =
  | { label: string; href: LinkProps["href"]; to?: never }
  | { label: string; href?: never; to: LinkProps["to"] };

const navLinks: FooterLink[] = [
  { label: m.footer__playground(), to: "/playground" },
  { label: m.footer__dashboard(), to: "/dashboard" },
  { label: m.footer__privacy_policy(), to: "/privacy-policy" },
  { label: m.footer__terms_of_service(), to: "/terms-of-service" },
];

const socialLinks: (FooterLink & { icon: React.ReactNode })[] = [
  {
    href: "https://github.com/tsu-moe",
    icon: <XIcon className="size-3" />,
    label: m.footer__x(),
  },
  {
    href: "https://github.com/tsu-moe/tsu-stack",
    icon: <FaGithub className="size-4" />,
    label: m.footer__github(),
  },
];

export function Footer({
  props,
  className,
}: {
  props?: React.ComponentProps<"footer">;
  className?: string;
}) {
  return (
    <footer className={cn("border-t", className)} {...props}>
      <div className="container mx-auto flex flex-col gap-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoWordmark className="h-4.5 w-fit" />
          </div>
          <div className="flex items-center gap-1">
            {socialLinks.map(({ href, label, icon }) => (
              <Button asChild key={label} size="icon-sm" variant="ghost">
                <Link aria-label={label} href={href}>
                  {icon}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <nav>
          <ul className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground md:gap-6">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a className="hover:text-foreground" target="_blank" href={link.href}>
                    {link.label}
                  </a>
                ) : (
                  <Link className="hover:text-foreground" to={link.to}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="container mx-auto flex items-center justify-between gap-4 border-t px-4 py-6 text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {appConfig.site.author}
        </p>

        <p className="inline-flex items-center gap-1">
          <span>{m.footer__built_by()}</span>
          <Link
            aria-label="x/twitter"
            className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground hover:underline"
            href="https://github.com/tsu-moe"
            rel="noreferrer"
            target="_blank"
          >
            <Image
              width={32}
              height={32}
              alt={appConfig.site.author}
              className="size-4 rounded-full"
              src="https://github.com/tsu-moe.png"
            />
            {appConfig.site.author}
          </Link>
        </p>
      </div>
    </footer>
  );
}

function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="m18.9,1.153h3.682l-8.042,9.189,9.46,12.506h-7.405l-5.804-7.583-6.634,7.583H.469l8.6-9.831L0,1.153h7.593l5.241,6.931,6.065-6.931Zm-1.293,19.494h2.039L6.482,3.239h-2.19l13.314,17.408Z" />
    </svg>
  );
}
