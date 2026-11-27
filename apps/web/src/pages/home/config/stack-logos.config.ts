import betterAuthDark from "@/pages/home/assets/carousel-logos/better-auth-wordmark-dark.svg";
import betterAuthLight from "@/pages/home/assets/carousel-logos/better-auth-wordmark-light.svg";
import drizzleDark from "@/pages/home/assets/carousel-logos/drizzle-wordmark-dark.svg";
import drizzleLight from "@/pages/home/assets/carousel-logos/drizzle-wordmark-light.svg";
import postgresqlDark from "@/pages/home/assets/carousel-logos/postgresql-wordmark-dark.svg";
import postgresqlLight from "@/pages/home/assets/carousel-logos/postgresql-wordmark-light.svg";
import tanstackDark from "@/pages/home/assets/carousel-logos/tanstack-wordmark-dark.svg";
import tanstackLight from "@/pages/home/assets/carousel-logos/tanstack-wordmark-light.svg";
import typescriptDark from "@/pages/home/assets/carousel-logos/typescript-wordmark-dark.svg";
import typescriptLight from "@/pages/home/assets/carousel-logos/typescript-wordmark-light.svg";
import vitePlusDark from "@/pages/home/assets/carousel-logos/vite-plus-dark.svg";
import vitePlusLight from "@/pages/home/assets/carousel-logos/vite-plus-light.svg";

// Density and vertical center are alpha-weighted fractions of each tightly framed SVG.
export const wordmarks = [
  { name: "Vite+", light: vitePlusLight, dark: vitePlusDark, width: 103, height: 15, density: 0.487, centerY: 0.46 },
  {
    name: "TypeScript",
    light: typescriptLight,
    dark: typescriptDark,
    width: 96,
    height: 24,
    density: 0.181,
    centerY: 0.469
  },
  {
    name: "TanStack",
    light: tanstackLight,
    dark: tanstackDark,
    width: 321.33,
    height: 50,
    density: 0.528,
    centerY: 0.496
  },
  { name: "Drizzle", light: drizzleLight, dark: drizzleDark, width: 232, height: 36, density: 0.206, centerY: 0.565 },
  {
    name: "PostgreSQL",
    light: postgresqlLight,
    dark: postgresqlDark,
    width: 130,
    height: 27,
    density: 0.257,
    centerY: 0.443
  },
  {
    name: "Better Auth",
    light: betterAuthLight,
    dark: betterAuthDark,
    width: 398,
    height: 47,
    density: 0.285,
    centerY: 0.519
  }
].map(({ width, height, density, centerY, ...wordmark }) => {
  return {
    ...wordmark,
    width: Math.round(width),
    height,
    // Interpolate between equal width and equal height, then compensate for visual weight.
    widthScale: (width / height) ** 0.6 * (0.35 / density) ** 0.25,
    offsetY: (0.5 - centerY) * 100
  };
});
