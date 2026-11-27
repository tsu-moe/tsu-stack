import { type ReactNode } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";

export function AuthPanel({
  title,
  description,
  children
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 motion-safe:animate-in motion-safe:duration-200 motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-wide">{title}</h1>
        {description && <p className="text-base text-muted-foreground">{description}</p>}
      </div>
      {children}
      <p className="mt-4 text-sm text-muted-foreground">
        {m.auth__terms_agreement()}{" "}
        <Link className="underline underline-offset-4 hover:text-primary" to="/terms-of-service">
          {m.auth__terms_of_service()}
        </Link>{" "}
        {m.auth__and()}{" "}
        <Link className="underline underline-offset-4 hover:text-primary" to="/privacy-policy">
          {m.auth__privacy_policy()}
        </Link>
        {m.auth__terms_agreement_end()}
      </p>
    </div>
  );
}
