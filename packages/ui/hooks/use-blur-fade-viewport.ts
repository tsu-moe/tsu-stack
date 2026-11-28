import { useEffect, useRef } from "react";

export function useBlurFadeViewport() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (
      !root ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const { isIntersecting, target } of entries) {
          if (!isIntersecting || !(target instanceof HTMLElement)) continue;
          if (target.dataset.blurFadeState === "pending") target.dataset.blurFadeState = "entering";
          observer.unobserve(target);
        }
      },
      { rootMargin: "0px 0px -60px 0px" }
    );
    const viewportHeight = document.documentElement.clientHeight;

    // Arm the initial keyframe offscreen. Content that has already been seen stays in place.
    for (const group of root.querySelectorAll<HTMLElement>('[data-blur-fade="viewport"]')) {
      if (group.getBoundingClientRect().top < viewportHeight || group.contains(document.activeElement)) continue;
      group.dataset.blurFadeState = "pending";
      observer.observe(group);
    }

    function finishOnFocus(event: FocusEvent) {
      if (!(event.target instanceof Element)) return;
      const group = event.target.closest<HTMLElement>("[data-blur-fade]");
      if (!group) return;
      group.dataset.blurFadeState = "settled";
      observer.unobserve(group);
    }

    function finishEntrance(event: AnimationEvent) {
      if (event.animationName === "blur-fade" && event.target instanceof HTMLElement) {
        event.target.dataset.blurFadeState = "settled";
      }
    }

    root.addEventListener("focusin", finishOnFocus);
    root.addEventListener("animationend", finishEntrance);
    return () => {
      observer.disconnect();
      root.removeEventListener("focusin", finishOnFocus);
      root.removeEventListener("animationend", finishEntrance);
    };
  }, []);

  return rootRef;
}
