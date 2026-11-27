"use client";

import { AtSignIcon } from "lucide-react";
import { type FormEvent } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@tsu-stack/ui/components/input-group";
import { Separator, SeparatorContent } from "@tsu-stack/ui/components/separator";
import { toast } from "@tsu-stack/ui/components/toast";
import { cn } from "@tsu-stack/ui/lib/utils";

import { GithubIcon } from "@/shared/ui/github-icon";
import { GoogleIcon } from "@/shared/ui/google-icon";
import { Logo } from "@/shared/ui/logo";
import { VercelIcon } from "@/shared/ui/vercel-icon";

import { appConfig } from "@/config/app.config";

function showComingSoon() {
  toast.info({ title: m.auth__not_yet_implemented() });
}

export function Auth({ onContinueEmail }: { onContinueEmail: (email: string) => void }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    if (typeof email === "string") onContinueEmail(email);
  }

  return (
    <div
      className={cn(
        "mx-auto flex h-full flex-col items-center justify-center gap-6 sm:w-xs",
        "animate-in delay-100 duration-800 fill-mode-backwards fade-in slide-in-from-bottom-4"
      )}
    >
      <Link
        className="z-10 block w-max rounded-md p-2 hover:bg-muted"
        to="/"
        aria-label={m.navbar__home({ siteName: appConfig.site.shortName })}
      >
        <Logo className="h-4.5" />
      </Link>
      <h1 className="font-heading text-center text-xl font-semibold">{m.auth__welcome_title()}</h1>
      <div className="grid w-full gap-3">
        <Button className="w-full" size="lg" variant="outline" onClick={showComingSoon}>
          <GoogleIcon data-icon="inline-start" />
          {m.auth__continue_with_google()}
        </Button>
        <Button className="w-full" size="lg" variant="outline" onClick={showComingSoon}>
          <VercelIcon data-icon="inline-start" />
          {m.auth__continue_with_vercel()}
        </Button>

        <Button className="w-full" size="lg" variant="outline" onClick={showComingSoon}>
          <GithubIcon data-icon="inline-start" />
          {m.auth__continue_with_github()}
        </Button>
      </div>
      <Separator className="w-full">
        <SeparatorContent>{m.auth__or()}</SeparatorContent>
      </Separator>
      <form className="w-full space-y-3" onSubmit={handleSubmit}>
        <InputGroup className="flex w-full">
          <InputGroupInput
            placeholder={m.auth__email_entry_placeholder()}
            aria-label={m.auth__email_label()}
            autoComplete="email"
            name="email"
            required
            type="email"
          />
          <InputGroupAddon align="inline-start">
            <AtSignIcon />
          </InputGroupAddon>
        </InputGroup>

        <Button className="w-full" type="submit" variant="outline">
          {m.auth__continue_with_email()}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">
        {m.auth__privacy_notice_prefix()}{" "}
        <Link className="underline underline-offset-4 hover:text-primary" to="/privacy-policy">
          {m.auth__privacy_policy()}
        </Link>
        .
      </p>
    </div>
  );
}
