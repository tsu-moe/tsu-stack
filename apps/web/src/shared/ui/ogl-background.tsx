import { useLayoutEffect, useRef } from "react";

import { type mountOglBackground } from "@/shared/lib/ogl-background-renderer";

// Keep one stopped renderer available between the hero and desktop auth routes.
let parkedBackground: ReturnType<typeof mountOglBackground>;

export function OglBackground({
  reuseOnNavigation = false,
  deferUntilIdle = false
}: {
  reuseOnNavigation?: boolean;
  deferUntilIdle?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let nearby = false;
    let visible = false;
    let disposed = false;
    let importStarted = false;
    let attempted = false;
    let mountFrame = 0;
    let canStart = !deferUntilIdle;
    let idleRequest = 0;
    let fallbackTimer = 0;
    let mount: typeof mountOglBackground | undefined;
    let background: ReturnType<typeof mountOglBackground>;

    const reuseBackground = () => {
      if (
        !reuseOnNavigation ||
        !parkedBackground ||
        reducedMotion.matches ||
        document.hidden ||
        !container.clientWidth ||
        !container.clientHeight
      ) {
        return;
      }

      const cached = parkedBackground;
      parkedBackground = undefined;
      if (cached.attach(container)) {
        background = cached;
        attempted = true;
      }
    };

    // A warm canvas can fit and draw in the new panel before its first paint.
    reuseBackground();

    const syncBackground = () => {
      if (disposed) return;

      if (reducedMotion.matches) {
        background?.dispose();
        background = undefined;
        attempted = false;
        if (reuseOnNavigation) {
          parkedBackground?.dispose();
          parkedBackground = undefined;
        }
      }

      const playing = visible && !document.hidden && !reducedMotion.matches;
      if (playing && !background) reuseBackground();
      if (canStart && !reducedMotion.matches && nearby && !background && !importStarted) {
        importStarted = true;
        void import("@/shared/lib/ogl-background-renderer")
          .then((module) => {
            mount = module.mountOglBackground;
            syncBackground();
          })
          .catch(() => {
            // The server-rendered gradient remains available if the chunk fails to load.
          });
      }

      background?.setVisible(playing);
      if (!playing) {
        cancelAnimationFrame(mountFrame);
        mountFrame = 0;
        return;
      }

      if (!mount || attempted || mountFrame) return;
      const mountRenderer = mount;
      // Let the browser paint the static gradient before compiling shaders.
      mountFrame = requestAnimationFrame(() => {
        mountFrame = requestAnimationFrame(() => {
          mountFrame = 0;
          if (!visible || document.hidden || reducedMotion.matches) return;
          attempted = true;
          background = mountRenderer(container);
          background?.setVisible(true);
        });
      });
    };

    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        nearby = true;
        preloadObserver.disconnect();
        syncBackground();
      },
      { rootMargin: "160px" }
    );
    const playbackObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      syncBackground();
    });
    preloadObserver.observe(container);
    playbackObserver.observe(container);

    const scheduleBackground = () => {
      const start = () => {
        canStart = true;
        syncBackground();
      };
      if (typeof window.requestIdleCallback === "function") {
        idleRequest = window.requestIdleCallback(start, { timeout: 1500 });
      } else {
        fallbackTimer = window.setTimeout(start, 150);
      }
    };
    if (deferUntilIdle) {
      if (document.readyState === "complete") scheduleBackground();
      else window.addEventListener("load", scheduleBackground, { once: true });
    }

    document.addEventListener("visibilitychange", syncBackground);
    reducedMotion.addEventListener("change", syncBackground);

    return () => {
      disposed = true;
      cancelAnimationFrame(mountFrame);
      if (idleRequest) window.cancelIdleCallback(idleRequest);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      window.removeEventListener("load", scheduleBackground);
      preloadObserver.disconnect();
      playbackObserver.disconnect();
      document.removeEventListener("visibilitychange", syncBackground);
      reducedMotion.removeEventListener("change", syncBackground);
      if (reuseOnNavigation && background?.park()) {
        parkedBackground?.dispose();
        parkedBackground = background;
      } else {
        background?.dispose();
      }
    };
  }, [reuseOnNavigation, deferUntilIdle]);

  return (
    <div ref={containerRef} aria-hidden="true" className="ogl-background pointer-events-none absolute inset-0 -z-10" />
  );
}
