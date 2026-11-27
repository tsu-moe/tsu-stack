import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@tsu-stack/ui/components/accordion";
import { Button } from "@tsu-stack/ui/components/button";

import { repositoryUrl } from "@/shared/ui/nav-links";

const questions = [
  { id: "about", question: m.home_page__faq_about_question, answer: m.home_page__faq_about_answer },
  { id: "included", question: m.home_page__faq_included_question, answer: m.home_page__faq_included_answer },
  { id: "start", question: m.home_page__faq_start_question, answer: m.home_page__faq_start_answer },
  { id: "styling", question: m.home_page__faq_styling_question, answer: m.home_page__faq_styling_answer },
  { id: "locales", question: m.home_page__faq_locales_question, answer: m.home_page__faq_locales_answer },
  { id: "deploy", question: m.home_page__faq_deploy_question, answer: m.home_page__faq_deploy_answer }
];

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="home-faq-title"
      className="grid scroll-mt-24 items-start gap-7 py-12 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-12 lg:gap-20 lg:py-16"
    >
      <div className="flex max-w-sm flex-col items-start gap-4">
        <h2 id="home-faq-title" className="font-heading max-w-xs text-3xl font-semibold tracking-tight sm:text-4xl">
          {m.home_page__faq_title()}
        </h2>
        <p className="max-w-xs leading-relaxed text-muted-foreground">{m.home_page__faq_description()}</p>
        <Button size="sm" nativeLink render={<Link href={`${repositoryUrl}/issues`} />}>
          {m.home_page__faq_contact()}
        </Button>
      </div>
      <Accordion className="min-w-0" defaultValue={["about"]}>
        {questions.map(({ id, question, answer }) => (
          <AccordionItem key={id} value={id}>
            <AccordionTrigger className="rounded-md py-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
              {question()}
            </AccordionTrigger>
            <AccordionContent className="ps-0 pe-7 pb-4 leading-relaxed">
              <p>{answer()}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
