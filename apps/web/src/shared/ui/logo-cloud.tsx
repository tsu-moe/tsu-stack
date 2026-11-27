import { InfiniteSlider } from "@/shared/ui/infinite-slider";
// https://motion-primitives.com/docs/progressive-blur
import { ProgressiveBlur } from "@/shared/ui/progressive-blur";

export function LogoCloud() {
  return (
    <div className="relative border-x border-y bg-linear-to-r from-secondary via-transparent to-secondary py-6">
      <InfiniteSlider gap={42} reverse speed={60} speedOnHover={20}>
        {technologies.map((technology) => (
          <span key={technology} className="text-sm font-semibold whitespace-nowrap md:text-base">
            {technology}
          </span>
        ))}
      </InfiniteSlider>

      <ProgressiveBlur
        blurIntensity={1}
        className="pointer-events-none absolute top-0 left-0 h-full w-[100px] md:w-[160px]"
        direction="left"
      />
      <ProgressiveBlur
        blurIntensity={1}
        className="pointer-events-none absolute top-0 right-0 h-full w-[100px] md:w-[160px]"
        direction="right"
      />
    </div>
  );
}

const technologies = [
  "Vite+",
  "TanStack Start",
  "Hono",
  "oRPC",
  "Drizzle",
  "Better Auth",
  "Paraglide",
  "iandefined/ui"
];
