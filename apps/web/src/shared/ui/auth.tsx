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
      <Link className="z-10 block w-max rounded-md p-2 hover:bg-muted" to="/" aria-label="Efferd">
        <Logo className="h-4.5" />
      </Link>
      <h1 className="font-heading text-center text-xl font-semibold">login or create your account.</h1>
      <div className="grid w-full gap-3">
        <Button className="w-full" size="lg" variant="outline" onClick={showComingSoon}>
          <GoogleIcon data-icon="inline-start" />
          Continue with Google
        </Button>
        <Button className="w-full" size="lg" variant="outline" onClick={showComingSoon}>
          <VercelIcon data-icon="inline-start" />
          Continue with Vercel
        </Button>

        <Button className="w-full" size="lg" variant="outline" onClick={showComingSoon}>
          <GithubIcon data-icon="inline-start" />
          Continue with GitHub
        </Button>
      </div>
      <Separator className="w-full">
        <SeparatorContent>OR</SeparatorContent>
      </Separator>
      <form className="w-full space-y-3" onSubmit={handleSubmit}>
        <InputGroup className="flex w-full">
          <InputGroupInput
            placeholder="Enter your email address"
            aria-label="Email"
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
          Continue With Email
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">
        By continuing, you agree to efferd’s{" "}
        <Link className="underline underline-offset-4 hover:text-primary" to="/privacy-policy">
          privacy policy
        </Link>
        .
      </p>
    </div>
  );
}
