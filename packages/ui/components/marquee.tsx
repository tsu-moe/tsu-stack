"use client";

import { cn } from "cn";
import * as React from "react";

type MarqueeProps = React.ComponentPropsWithoutRef<"div"> & {
  /**
   * Duration of one complete loop, in seconds. Lower values move faster.
   */
  speed?: number;
  /**
   * Direction in which the content travels.
   */
  direction?: "left" | "right";
  /**
   * Pause the loop while the pointer is over the marquee.
   */
  pauseOnHover?: boolean;
  /**
   * Gap between items and repeated content groups. Accepts a CSS length or a
   * number of pixels.
   */
  gap?: number | string;
  /**
   * Add a soft fade at the edges of the viewport while content is moving.
   */
  fade?: boolean;
  /**
   * Optional CSS color used by the edge fades. When omitted, the fade uses a
   * mask so it automatically blends into the surface behind the marquee. Set
   * it to use an explicitly painted fade instead.
   */
  fadeColor?: string;
  /**
   * Only animate when the natural content width is wider than the viewport.
   */
  onlyOnOverflow?: boolean;
};

type MarqueeDirection = NonNullable<MarqueeProps["direction"]>;

type MarqueeStyle = React.CSSProperties & {
  "--marquee-duration"?: string;
  "--marquee-fade-color"?: string;
  "--marquee-gap"?: string;
  "--marquee-distance"?: string;
};

type MarqueeMetrics = {
  copyCount: number;
  distance: number;
  isOverflowing: boolean;
  measured: boolean;
};

const defaultMetrics: MarqueeMetrics = {
  copyCount: 2,
  distance: 0,
  isOverflowing: false,
  measured: false
};

const MARQUEE_STYLES = `
@keyframes tw-marquee-left {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(calc(var(--marquee-distance, 0px) * -1), 0, 0); }
}
@keyframes tw-marquee-right {
  from { transform: translate3d(calc(var(--marquee-distance, 0px) * -1), 0, 0); }
  to { transform: translate3d(0, 0, 0); }
}
[data-slot="marquee-track"] {
  display: flex;
  gap: var(--marquee-gap, 2rem);
  min-width: max-content;
  width: max-content;
}
[data-slot="marquee"][data-animating="true"] [data-slot="marquee-track"] {
  animation-duration: var(--marquee-duration, 30s);
  animation-iteration-count: infinite;
  animation-name: tw-marquee-left;
  animation-play-state: running;
  animation-timing-function: linear;
  will-change: transform;
}
[data-slot="marquee"][data-direction="right"][data-animating="true"] [data-slot="marquee-track"] {
  animation-name: tw-marquee-right;
}
[data-slot="marquee"][data-animating="false"] [data-slot="marquee-track"] {
  animation: none;
  transform: none;
}
[data-slot="marquee"][data-pause-on-hover="true"][data-animating="true"]:hover [data-slot="marquee-track"] {
  animation-play-state: paused;
}
[data-slot="marquee"][data-animating="false"] [data-copy="true"] {
  visibility: hidden;
}
[data-slot="marquee"][data-fade="true"][data-fade-mode="auto"][data-animating="true"] {
  -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
  mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
}
[data-slot="marquee"][data-fade="true"][data-fade-mode="custom"][data-animating="true"]::before,
[data-slot="marquee"][data-fade="true"][data-fade-mode="custom"][data-animating="true"]::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
  width: 2rem;
  pointer-events: none;
}
[data-slot="marquee"][data-fade="true"][data-fade-mode="custom"][data-animating="true"]::before {
  left: 0;
  background: linear-gradient(to right, var(--marquee-fade-color, var(--background)), transparent);
}
[data-slot="marquee"][data-fade="true"][data-fade-mode="custom"][data-animating="true"]::after {
  right: 0;
  background: linear-gradient(to left, var(--marquee-fade-color, var(--background)), transparent);
}
@media (prefers-reduced-motion: reduce) {
  [data-slot="marquee"] [data-slot="marquee-track"] {
    animation: none !important;
    transform: none !important;
  }
  [data-slot="marquee"] [data-copy="true"] {
    visibility: hidden;
  }
  [data-slot="marquee"][data-fade="true"][data-fade-mode="auto"] {
    -webkit-mask-image: none !important;
    mask-image: none !important;
  }
  [data-slot="marquee"][data-fade="true"][data-fade-mode="custom"]::before,
  [data-slot="marquee"][data-fade="true"][data-fade-mode="custom"]::after {
    display: none;
  }
}
`;

const getCssLength = (value: number | string) => (typeof value === "number" ? `${Math.max(0, value)}px` : value);

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(function Marquee(
  {
    children,
    className,
    direction = "left",
    fade = true,
    fadeColor,
    gap = "2rem",
    onlyOnOverflow = true,
    pauseOnHover = false,
    speed = 30,
    style,
    ...props
  },
  forwardedRef
) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const firstGroupRef = React.useRef<HTMLDivElement | null>(null);
  const secondGroupRef = React.useRef<HTMLDivElement | null>(null);
  const [metrics, setMetrics] = React.useState(defaultMetrics);
  const gapValue = getCssLength(gap);
  const duration = `${Math.max(0.1, speed)}s`;

  const setViewportRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;

      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef]
  );

  const measure = React.useCallback(() => {
    const viewport = viewportRef.current;
    const firstGroup = firstGroupRef.current;
    const secondGroup = secondGroupRef.current;

    if (!viewport || !firstGroup || !secondGroup) {
      return;
    }

    const firstRect = firstGroup.getBoundingClientRect();
    const secondRect = secondGroup.getBoundingClientRect();
    const distance = Math.max(1, Math.ceil(secondRect.left - firstRect.left));
    const isOverflowing = firstRect.width > viewport.clientWidth + 1;
    const copyCount = onlyOnOverflow ? 2 : Math.max(2, Math.ceil(viewport.clientWidth / distance) + 2);

    setMetrics((current) => {
      if (
        current.copyCount === copyCount &&
        current.distance === distance &&
        current.isOverflowing === isOverflowing &&
        current.measured
      ) {
        return current;
      }

      return {
        copyCount,
        distance,
        isOverflowing,
        measured: true
      };
    });
  }, [onlyOnOverflow]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    const firstGroup = firstGroupRef.current;

    if (!viewport || !firstGroup || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(firstGroup);
    measure();

    return () => observer.disconnect();
  }, [gapValue, measure]);

  const isAnimating = metrics.measured && (!onlyOnOverflow || metrics.isOverflowing);
  const marqueeStyle: MarqueeStyle = {
    ...style,
    "--marquee-distance": `${metrics.distance}px`,
    "--marquee-duration": duration,
    ...(fadeColor === undefined ? {} : { "--marquee-fade-color": fadeColor }),
    "--marquee-gap": gapValue
  };

  return (
    <div
      {...props}
      ref={setViewportRef}
      className={cn("relative w-full overflow-hidden", className)}
      data-animating={isAnimating ? "true" : "false"}
      data-direction={direction}
      data-fade={fade ? "true" : "false"}
      data-fade-mode={fadeColor === undefined ? "auto" : "custom"}
      data-overflowing={metrics.isOverflowing ? "true" : "false"}
      data-pause-on-hover={pauseOnHover ? "true" : "false"}
      data-slot="marquee"
      style={marqueeStyle}
    >
      <div data-slot="marquee-track">
        {Array.from({ length: metrics.copyCount }, (_, index) => (
          <div
            aria-hidden={index > 0 ? true : undefined}
            className="flex shrink-0 items-center gap-[var(--marquee-gap)] whitespace-nowrap"
            data-copy={index > 0 ? "true" : undefined}
            data-slot="marquee-group"
            key={index}
            ref={index === 0 ? firstGroupRef : index === 1 ? secondGroupRef : undefined}
          >
            {children}
          </div>
        ))}
      </div>
      <style>{MARQUEE_STYLES}</style>
    </div>
  );
});

Marquee.displayName = "Marquee";

export { Marquee };
export type { MarqueeDirection, MarqueeProps };
