import { type CSSProperties } from "react";

const PATH_COUNT = 36;

/**
 * Decorative flowing lines.
 *
 * Two rendering rules keep this cheap in every engine:
 *
 * 1. CSS keyframes, not a JS animation loop. The old motion/react version wrote
 *    3 attributes to 72 paths on every frame, so any other repaint on the page
 *    (hover, focus, scroll) collided with it and the frame flickered.
 * 2. Never animate `opacity` on an SVG child. Chrome has to render every
 *    translucent SVG element into its own offscreen transparency group the
 *    size of the element's bounds — here 72 near-full-column buffers per
 *    frame — which is what made Chrome flicker while Safari was fine.
 *    `stroke-opacity` is just alpha in the stroke paint, so we animate that.
 */
export function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: PATH_COUNT }, (_, i) => {
    return {
      id: i,
      d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
        380 - i * 5 * position
      } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
        152 - i * 5 * position
      } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
        684 - i * 5 * position
      } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
      width: 0.5 + i * 0.03,
      // Peak stroke alpha; was `strokeOpacity * animated opacity` before.
      opacity: (0.06 + i * 0.018).toFixed(3),
      // Deterministic timing so SSR, hydration and re-renders agree.
      duration: 20 + (i % 6) * 2,
      delay: -(i * 0.7)
    };
  });

  return (
    // `isolate` + `contain-strict` keep the per-frame stroke repaints from
    // invalidating anything outside this box.
    <div className="pointer-events-none absolute inset-0 isolate contain-strict">
      <style href="floating-paths-keyframes" precedence="default">
        {
          "@keyframes floating-path{0%{stroke-dashoffset:1;stroke-opacity:0}15%,85%{stroke-opacity:var(--stroke-opacity)}100%{stroke-dashoffset:-1;stroke-opacity:0}}"
        }
      </style>
      <svg className="h-full w-full text-primary" fill="none" viewBox="0 0 696 316">
        {paths.map((path) => (
          <path
            className="motion-safe:animate-[floating-path_var(--duration)_linear_infinite]"
            d={path.d}
            key={path.id}
            // Normalise every path to length 1 so dash values are relative.
            pathLength={1}
            stroke="currentColor"
            // dash = full path, gap = full path; sweeping the offset from
            // 1 → -1 draws the line in from the start and then erases it,
            // ending invisible so the infinite loop has no seam.
            strokeDasharray="1 1"
            strokeOpacity={path.opacity}
            strokeWidth={path.width}
            style={
              {
                "--duration": `${path.duration}s`,
                "--stroke-opacity": path.opacity,
                animationDelay: `${path.delay}s`
              } as CSSProperties
            }
          />
        ))}
      </svg>
    </div>
  );
}
