import { Hydrate } from "@tanstack/react-start";
import { TerminalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@tsu-stack/ui/components/accordion";
import { BlurFade } from "@tsu-stack/ui/components/blur-fade";
import { Card, CardContent, CardHeader, CardTitle } from "@tsu-stack/ui/components/card";

import { OglBackground } from "@/shared/ui/ogl-background";

import { homeScrollReveal } from "@/pages/home/config/home-motion.config";
import { setupSteps } from "@/pages/home/config/setup-steps.config";
import { useDeferredAccordionIntent } from "@/pages/home/hooks/use-deferred-accordion-intent.hook";
import { useHomeWidgetHydration } from "@/pages/home/hooks/use-home-widget-hydration.hook";

import { SectionHeading } from "./section-heading";
import { SetupTerminalOutput } from "./setup-terminal-output";

const STEP_DURATION_MS = 6000;
const TERMINAL_OUTPUT_HOLD_MS = 2500;
const TERMINAL_ACTION_MS = STEP_DURATION_MS - TERMINAL_OUTPUT_HOLD_MS;
const TERMINAL_TICK_MS = 32;
const MIN_VISIBLE_RATIO = 0.25;

export function SetupSection() {
  const { ref, when, hydrate } = useHomeWidgetHydration();
  const { interactionProps, onHydrated } = useDeferredAccordionIntent(ref, hydrate);

  return (
    <section id="request-path" aria-labelledby="home-setup-title" className="scroll-mt-20">
      <SectionHeading
        id="home-setup-title"
        primary={m.home_page__setup_journey_title()}
        secondary={m.home_page__setup_journey_subtitle()}
      />
      <BlurFade {...homeScrollReveal} {...interactionProps} ref={ref} className="mt-8 sm:mt-11">
        <Hydrate
          when={when}
          onHydrated={onHydrated}
          fallback={<div aria-hidden="true" className="h-152 sm:h-138 lg:h-83" />}
        >
          <SetupDemo />
        </Hydrate>
      </BlurFade>
    </section>
  );
}

function SetupDemo() {
  const stepsRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canAutoplay, setCanAutoplay] = useState(false);
  const [terminalFrame, setTerminalFrame] = useState<{ stepId: string; progress: number }>();
  const activeStep = setupSteps[activeIndex]!;
  const terminalProgress = terminalFrame?.stepId === activeStep.id ? terminalFrame.progress : canAutoplay ? 0 : 1;

  useEffect(() => {
    const steps = stepsRef.current;
    if (!steps || typeof IntersectionObserver === "undefined") return;

    let inView = false;
    const updatePlayback = () => {
      setCanAutoplay(inView && !document.hidden);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = (entry?.intersectionRatio ?? 0) >= MIN_VISIBLE_RATIO;
        updatePlayback();
      },
      { threshold: MIN_VISIBLE_RATIO }
    );

    observer.observe(steps);
    document.addEventListener("visibilitychange", updatePlayback);
    updatePlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
    };
  }, []);

  useEffect(() => {
    if (!canAutoplay) return;

    let animation: Animation | undefined;
    const timer = window.setInterval(() => {
      animation ??= progressRef.current?.getAnimations()[0];
      const elapsed = animation?.currentTime;
      if (typeof elapsed !== "number") {
        window.clearInterval(timer);
        return;
      }

      const progress = Math.min(elapsed / TERMINAL_ACTION_MS, 1);
      setTerminalFrame({ stepId: activeStep.id, progress });
      if (progress === 1) window.clearInterval(timer);
    }, TERMINAL_TICK_MS);

    return () => window.clearInterval(timer);
  }, [activeStep.id, canAutoplay]);

  return (
    <div ref={stepsRef} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-12">
      <Accordion
        variant="split"
        className="gap-2 space-y-0"
        value={[activeStep.id]}
        onValueChange={([id]) => {
          const index = setupSteps.findIndex((step) => step.id === id);
          if (index < 0 || index === activeIndex) return;
          setTerminalFrame(undefined);
          setActiveIndex(index);
        }}
      >
        {setupSteps.map(({ id, title, description }, index) => (
          <AccordionItem
            key={id}
            value={id}
            className="relative isolate rounded-xl border-0 bg-transparent transition-colors hover:bg-muted/35 motion-reduce:transition-none lg:grow data-open:bg-muted/55"
          >
            {index === activeIndex && (
              <span
                ref={progressRef}
                data-slot="setup-step-progress"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 origin-left bg-foreground/6 motion-safe:animate-[setup-progress_linear_both] motion-reduce:hidden"
                style={{
                  animationDuration: STEP_DURATION_MS + "ms",
                  animationPlayState: canAutoplay ? "running" : "paused"
                }}
                onAnimationEnd={() =>
                  setActiveIndex((current) => (current === index ? (index + 1) % setupSteps.length : current))
                }
              />
            )}
            <AccordionTrigger
              showIndicator={false}
              aria-current={index === activeIndex ? "step" : undefined}
              className="rounded-xl px-5 py-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-panel-open:pb-0"
            >
              <span className="relative block">
                <span
                  aria-hidden="true"
                  className="block font-mono text-sm text-muted-foreground transition-colors duration-200 group-data-panel-open/trigger:text-foreground motion-reduce:transition-none"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-1.5 block text-lg font-medium tracking-tight text-muted-foreground transition-colors duration-200 group-data-panel-open/trigger:text-foreground motion-reduce:transition-none">
                  {title()}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent
              className="min-h-0 overflow-hidden p-0"
              render={(props) => (
                <div
                  {...props}
                  className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] not-data-open:grid-rows-[0fr] data-starting-style:grid-rows-[0fr] motion-reduce:transition-none"
                />
              )}
            >
              <span className="block max-w-sm px-5 pt-2 pb-4 text-sm leading-6 text-muted-foreground opacity-100 transition-opacity duration-300 in-data-ending-style:opacity-0 in-data-starting-style:opacity-0 motion-reduce:transition-none">
                {description()}
              </span>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div
        data-slot="setup-display"
        className="relative isolate flex min-w-0 flex-col overflow-hidden rounded-2xl bg-muted/40 p-2 sm:p-3"
      >
        <OglBackground />
        <Card className="min-w-0 flex-1 gap-0 overflow-hidden border-border/65 py-0 shadow-xs">
          <CardHeader className="flex px-5 py-3.5">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TerminalIcon className="size-4 text-muted-foreground" aria-hidden="true" />
              {activeStep.title()}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-40 min-w-0 flex-1 flex-col justify-center border-t border-border/60 bg-muted/25 px-5 pb-6 max-sm:pt-6 sm:min-h-46 lg:min-h-0">
            <SetupTerminalOutput
              key={activeStep.id}
              lines={activeStep.lines}
              progress={terminalProgress}
              actionDurationMs={TERMINAL_ACTION_MS}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
