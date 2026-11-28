import { m } from "@tsu-stack/i18n/messages";
import { Button } from "@tsu-stack/ui/components/button";
import { toast } from "@tsu-stack/ui/components/toast";

import { GithubIcon } from "@/shared/assets/icons/github-icon";

import { AppleIcon } from "@/features/auth/assets/apple-icon";
import { GoogleIcon } from "@/features/auth/assets/google-icon";

function showProviderToast() {
  toast.info({ title: m.auth__not_yet_implemented() });
}

export function SocialSignInButtons() {
  return (
    <div className="flex flex-col gap-3">
      <Button type="button" className="w-full" size="lg" variant="outline" onClick={showProviderToast}>
        <GoogleIcon data-icon="inline-start" aria-hidden="true" />
        {m.auth__continue_with_google()}
      </Button>
      <Button type="button" className="w-full" size="lg" variant="outline" onClick={showProviderToast}>
        <AppleIcon data-icon="inline-start" aria-hidden="true" />
        {m.auth__continue_with_apple()}
      </Button>
      <Button type="button" className="w-full" size="lg" variant="outline" onClick={showProviderToast}>
        <GithubIcon data-icon="inline-start" aria-hidden="true" />
        {m.auth__continue_with_github()}
      </Button>
    </div>
  );
}
