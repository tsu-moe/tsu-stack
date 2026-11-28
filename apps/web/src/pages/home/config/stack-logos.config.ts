import betterAuthDark from "@/pages/home/assets/carousel-logos/better-auth-wordmark-dark.svg?no-inline";
import betterAuthLight from "@/pages/home/assets/carousel-logos/better-auth-wordmark-light.svg?no-inline";
import docker from "@/pages/home/assets/carousel-logos/docker-icon.svg?no-inline";
import drizzleDark from "@/pages/home/assets/carousel-logos/drizzle-wordmark-dark.svg?no-inline";
import drizzleLight from "@/pages/home/assets/carousel-logos/drizzle-wordmark-light.svg?no-inline";
import hono from "@/pages/home/assets/carousel-logos/hono-icon.svg?no-inline";
import postgresqlDark from "@/pages/home/assets/carousel-logos/postgresql-wordmark-dark.svg?no-inline";
import postgresqlLight from "@/pages/home/assets/carousel-logos/postgresql-wordmark-light.svg?no-inline";
import tailwind from "@/pages/home/assets/carousel-logos/tailwind-css-icon.svg?no-inline";
import tanstackDark from "@/pages/home/assets/carousel-logos/tanstack-wordmark-dark.svg?no-inline";
import tanstackLight from "@/pages/home/assets/carousel-logos/tanstack-wordmark-light.svg?no-inline";
import typescript from "@/pages/home/assets/carousel-logos/typescript-icon.svg?no-inline";
import vitePlusDark from "@/pages/home/assets/carousel-logos/vite-plus-dark.svg?no-inline";
import vitePlusLight from "@/pages/home/assets/carousel-logos/vite-plus-light.svg?no-inline";

type StackLogo = {
  name: string;
  src: string;
  dark?: string;
  width: number;
  height: number;
  density: number;
  centerY: number;
};

const logos: StackLogo[] = [
  { name: "Vite+", src: vitePlusLight, dark: vitePlusDark, width: 102.875, height: 15, density: 0.488, centerY: 0.46 },
  { name: "TypeScript", src: typescript, width: 24, height: 24, density: 0.816, centerY: 0.47 },
  {
    name: "TanStack",
    src: tanstackLight,
    dark: tanstackDark,
    width: 321.33,
    height: 50,
    density: 0.528,
    centerY: 0.496
  },
  { name: "Hono", src: hono, width: 76, height: 98, density: 0.669, centerY: 0.575 },
  {
    name: "Better Auth",
    src: betterAuthLight,
    dark: betterAuthDark,
    width: 396.75,
    height: 45.75,
    density: 0.294,
    centerY: 0.512
  },
  { name: "Tailwind CSS", src: tailwind, width: 24, height: 14.5, density: 0.34, centerY: 0.5 },
  {
    name: "Drizzle",
    src: drizzleLight,
    dark: drizzleDark,
    width: 230.125,
    height: 34.5,
    density: 0.217,
    centerY: 0.575
  },
  { name: "Docker", src: docker, width: 24, height: 17.25, density: 0.525, centerY: 0.579 },
  {
    name: "PostgreSQL",
    src: postgresqlLight,
    dark: postgresqlDark,
    width: 128.25,
    height: 25.875,
    density: 0.272,
    centerY: 0.443
  }
];

export const stackLogos = logos.map(({ density, centerY, ...logo }) => {
  return {
    ...logo,
    widthScale: (logo.width / logo.height) ** (2 / 3) * (0.35 / density) ** 0.25,
    offsetY: (0.5 - centerY) * 100
  };
});
