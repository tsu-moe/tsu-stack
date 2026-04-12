import { FaGithub } from "react-icons/fa";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";
import { DecorIcon } from "@tsu-stack/ui/components/decor-icon";

export function CallToAction() {
  return (
    <section className="mb-32 overflow-x-clip p-4">
      <div className="relative container mx-auto flex flex-col justify-between gap-y-4 border-y px-4 py-8 lg:max-w-4xl">
        <DecorIcon className="size-4" position="top-left" />
        <DecorIcon className="size-4" position="top-right" />
        <DecorIcon className="size-4" position="bottom-left" />
        <DecorIcon className="size-4" position="bottom-right" />

        <div className="pointer-events-none absolute -inset-y-6 -left-px w-px border-l" />
        <div className="pointer-events-none absolute -inset-y-6 -right-px w-px border-r" />

        <h2 className="font-display text-center text-xl md:text-4xl">{m.home_page__cta_title()}</h2>
        <p className="text-center text-sm text-balance text-muted-foreground md:text-base">
          {m.home_page__cta_description()}
        </p>

        <div className="flex items-center justify-center gap-2">
          <Button asChild variant="outline">
            <Link target="_blank" href="https://github.com/tsu-moe/tsu-stack">
              <FaGithub />
              {m.home_page__cta_github()}
            </Link>
          </Button>
          <Button asChild light="skeuomorphic">
            <Link target="_blank" href="https://github.com/tsu-moe/tsu-stack">
              {m.home_page__cta_documentation()}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
