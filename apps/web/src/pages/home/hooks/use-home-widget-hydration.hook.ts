import { condition } from "@tanstack/react-start/hydration";
import { useEffect, useRef, useState } from "react";

export function useHomeWidgetHydration() {
  const ref = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || nearViewport || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setNearViewport(true);
      },
      { rootMargin: "200px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [nearViewport]);

  // The condition strategy preserves the prerendered markup if an ancestor
  // updates while the deferred boundary is waiting to hydrate.
  const noIntersectionObserver = typeof window !== "undefined" && typeof IntersectionObserver === "undefined";
  return { ref, when: condition(nearViewport || noIntersectionObserver), hydrate: () => setNearViewport(true) };
}
