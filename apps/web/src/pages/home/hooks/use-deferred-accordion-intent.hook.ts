import { type FocusEvent, type MouseEvent, type RefObject, useRef } from "react";

const triggerSelector = 'button[data-slot="accordion-trigger"]';

export function useDeferredAccordionIntent(ref: RefObject<HTMLDivElement | null>, hydrate: () => void) {
  const hydrated = useRef(false);
  const pendingFocus = useRef<{ index: number; trigger: HTMLButtonElement } | null>(null);
  const pendingClick = useRef<number | null>(null);

  function findTrigger(event: FocusEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) {
    if (hydrated.current || !(event.target instanceof Element)) return;
    const trigger = event.target.closest<HTMLButtonElement>(triggerSelector);
    if (!trigger) return;
    const index = Array.from(event.currentTarget.querySelectorAll(triggerSelector)).indexOf(trigger);
    if (index >= 0) return { index, trigger };
  }

  return {
    interactionProps: {
      onFocusCapture(event: FocusEvent<HTMLDivElement>) {
        const focus = findTrigger(event);
        if (!focus) return;
        pendingFocus.current = focus;
        hydrate();
      },
      onClickCapture(event: MouseEvent<HTMLDivElement>) {
        const click = findTrigger(event);
        if (!click) return;
        event.preventDefault();
        event.stopPropagation();
        pendingClick.current = click.index;
        hydrate();
      }
    },
    onHydrated(this: void) {
      hydrated.current = true;
      const triggers = ref.current?.querySelectorAll<HTMLButtonElement>(triggerSelector);
      const focus = pendingFocus.current;
      const click = pendingClick.current;
      pendingFocus.current = null;
      pendingClick.current = null;

      // The preserved HTML may be replaced when its interactive chunk attaches.
      if (focus && !focus.trigger.isConnected && document.activeElement === document.body) {
        triggers?.[focus.index]?.focus({ preventScroll: true });
      }
      if (click !== null) triggers?.[click]?.click();
    }
  };
}
