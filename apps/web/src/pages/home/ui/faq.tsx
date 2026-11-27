import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@tsu-stack/ui/components/accordion";
import { Button } from "@tsu-stack/ui/components/button";

import { GithubIcon } from "@/shared/assets/icons/github-icon";
import { repositoryUrl } from "@/shared/config/project-links";

import { questions } from "@/pages/home/config/faq.config";

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="home-faq-title"
      className="grid scroll-mt-20 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16"
    >
      <div className="flex flex-col items-start">
        <h2 id="home-faq-title" className="text-3xl font-medium tracking-tighter text-balance sm:text-4xl">
          {m.home_page__faq_title()}
        </h2>
        <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">{m.home_page__faq_description()}</p>
        <Button
          className="mt-4"
          size="lg"
          radius="full"
          variant="outline"
          nativeLink
          render={<Link href={`${repositoryUrl}/issues`} />}
        >
          <GithubIcon data-icon="inline-start" aria-hidden="true" />
          {m.home_page__faq_contact()}
        </Button>
      </div>
      <Accordion variant="isolated-filled" className="min-w-0" defaultValue={["about"]}>
        {questions.map(({ id, question, answer }) => (
          <AccordionItem key={id} value={id}>
            <AccordionTrigger className="rounded-md px-5 py-4 text-[15px] font-medium tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:text-base">
              {question()}
            </AccordionTrigger>
            <AccordionContent className="max-w-2xl px-5 pb-5 text-sm leading-6 text-muted-foreground opacity-100 transition-opacity duration-200 ease-out motion-reduce:transition-none">
              <p>{answer()}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
