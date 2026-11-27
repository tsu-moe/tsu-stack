import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { type NavigateTo } from "@tsu-stack/i18n/tanstack-start/types";
import { Button } from "@tsu-stack/ui/components/button";
import { Separator, SeparatorContent } from "@tsu-stack/ui/components/separator";
import { toast } from "@tsu-stack/ui/components/toast";

import { AppleIcon } from "@/shared/ui/apple-icon";
import { GithubIcon } from "@/shared/ui/github-icon";
import { GoogleIcon } from "@/shared/ui/google-icon";

import { AuthPanel } from "@/features/auth/ui/auth-panel";

function showProviderToast() {
  toast.info({ title: m.auth__not_yet_implemented() });
}

export function AuthOptions({ redirectTo }: { redirectTo: NavigateTo }) {
  return (
    <AuthPanel title={m.auth__welcome_title()} description={m.auth__choose_method()}>
      <div className="flex flex-col gap-2">
        <Button className="w-full" onClick={showProviderToast}>
          <GoogleIcon data-icon="inline-start" />
          {m.auth__continue_with_google()}
        </Button>
        <Button className="w-full" onClick={showProviderToast}>
          <AppleIcon data-icon="inline-start" />
          {m.auth__continue_with_apple()}
        </Button>
        <Button className="w-full" onClick={showProviderToast}>
          <GithubIcon data-icon="inline-start" />
          {m.auth__continue_with_github()}
        </Button>
      </div>
      <Separator>
        <SeparatorContent>{m.auth__email_label()}</SeparatorContent>
      </Separator>
      <Button
        className="w-full"
        nativeButton={false}
        render={<Link to="/sign-in/password" search={{ redirect: redirectTo }} />}
      >
        {m.auth__continue_with_email()}
      </Button>
    </AuthPanel>
  );
}
