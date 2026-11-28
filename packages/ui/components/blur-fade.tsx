import { type ComponentPropsWithRef, type CSSProperties } from "react";

type BlurFadeProps = ComponentPropsWithRef<"div"> & {
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  inView?: boolean;
  blur?: string;
  initialOpacity?: number;
  easing?: CSSProperties["animationTimingFunction"];
};

/**
 * Reveals content by fading it in, clearing its blur, and moving it a short distance
 * into place. Use it for occasional marketing or onboarding entrances. Keep
 * frequently used controls, keyboard feedback, and content needed immediately steady.
 *
 * The defaults are tuned for one-time section entrances. Duration and delay are in
 * seconds, offset is in CSS pixels, and direction describes the direction of travel.
 * For example, `direction="up"` enters from below. Set `blur` to a CSS length,
 * `initialOpacity` to a value from 0 to 1, and `easing` to a CSS timing function.
 * The same easing controls the opacity, blur, and transform.
 *
 * Add `inView` for a scroll reveal. Attach the ref returned by
 * `useBlurFadeViewport()` to an ancestor that contains the reveals when it mounts.
 * The hook arms offscreen groups once and starts them 60px inside the viewport.
 * Already visible content stays in place. Without the observer, the server-rendered
 * content remains visible. Focusing a group finishes its entrance immediately.
 *
 * The default paint mode starts from CSS as soon as the page is styled, before
 * React hydrates. Use it for a short hero sequence. On a server-rendered route,
 * the full HTML is in the initial response and the animation leaves layout space intact.
 * CSS skips the animation entirely for `prefers-reduced-motion: reduce`.
 *
 * Suggested starting values. Choose the timing that fits the content.
 *
 * | Use case | Duration | Offset | Delay |
 * | --- | ---: | ---: | ---: |
 * | Section heading | 700ms | 14px | 0ms |
 * | Standard content | 700ms | 14px | 80ms |
 * | Secondary content | 700ms | 14px | 100ms |
 * | Repeated cards | 700ms | 14px | 80ms + 60ms per item |
 * | Hero heading | 600ms | 12px | 0ms |
 * | Hero description | 600ms | 12px | 60ms |
 * | Hero buttons | 600ms | 12px | 120ms |
 *
 * For repeated elements, use `80 + index * 60` milliseconds. For hero copy,
 * use the shorter paint sequence with 60ms between groups. A hero preview that
 * needs a top-to-bottom clip reveal can use a separate 1000ms clip-path animation
 * with a 60ms delay.
 *
 * @example Standard section content
 * ```tsx
 * <BlurFade inView>
 *   <div>Section content</div>
 * </BlurFade>
 * ```
 *
 * @example Section heading without delay
 * ```tsx
 * <BlurFade inView delay={0}>
 *   <h2>Section heading</h2>
 * </BlurFade>
 * ```
 *
 * @example Secondary content
 * ```tsx
 * <BlurFade inView delay={0.1}>
 *   <div>Secondary content</div>
 * </BlurFade>
 * ```
 *
 * @example Staggered card list
 * ```tsx
 * {items.map((item, index) => (
 *   <BlurFade key={item.id} inView delay={0.08 + index * 0.06}>
 *     <Card item={item} />
 *   </BlurFade>
 * ))}
 * ```
 *
 * @example Custom direction and offset
 * ```tsx
 * <BlurFade inView direction="left" offset={24} duration={0.8}>
 *   <div>Custom animated content</div>
 * </BlurFade>
 * ```
 */
export function BlurFade({
  duration = 0.7,
  delay = 0.08,
  offset = 14,
  direction = "down",
  inView = false,
  blur = "6px",
  initialOpacity = 0,
  easing = "cubic-bezier(0.23, 1, 0.32, 1)",
  style,
  ...props
}: BlurFadeProps) {
  const distance = direction === "right" || direction === "down" ? -offset : offset;
  const horizontal = direction === "left" || direction === "right";

  return (
    <div
      {...props}
      data-slot="blur-fade"
      data-blur-fade={inView ? "viewport" : "paint"}
      style={
        {
          ...style,
          "--blur-fade-duration": duration + "s",
          "--blur-fade-delay": delay + "s",
          "--blur-fade-x": (horizontal ? distance : 0) + "px",
          "--blur-fade-y": (horizontal ? 0 : distance) + "px",
          "--blur-fade-radius": blur,
          "--blur-fade-opacity": initialOpacity,
          "--blur-fade-easing": easing
        } as CSSProperties
      }
    />
  );
}
