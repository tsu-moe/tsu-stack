import { m } from "@tsu-stack/i18n/messages";

import { FullWidthDivider } from "@/shared/ui/full-width-divider";
import { LogoCloud } from "@/shared/ui/logo-cloud"; // @efferd/logo-cloud-4

export function LogosSection() {
  return (
    <section id="stack" className="pt-5 pb-10 *:border-r-0">
      <h2 className="font-heading mb-4 text-center text-lg font-medium tracking-tight text-muted-foreground md:text-xl">
        {m.home_page__stack_heading()}
      </h2>
      <div className="relative *:border-0">
        <FullWidthDivider contained className="-top-px" />
        <LogoCloud />
        <FullWidthDivider contained className="-bottom-px" />
      </div>
    </section>
  );
}
