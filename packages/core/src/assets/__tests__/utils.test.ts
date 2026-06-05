import { describe, expect, it } from "vitest";

import { resolvePublicAssetUrl } from "#@/assets/utils";

describe("resolvePublicAssetUrl", () => {
  describe("happy path behavior", () => {
    it.each([
      {
        name: "joins a root base url with a leading-slash asset path",
        baseUrl: "/",
        publicAssetPath: "/img/home/hero-screen-light.webp",
        expected: "/img/home/hero-screen-light.webp"
      },
      {
        name: "joins a nested base url with a leading-slash asset path",
        baseUrl: "/app/",
        publicAssetPath: "/img/logos/vercel-wordmark.svg",
        expected: "/app/img/logos/vercel-wordmark.svg"
      },
      {
        name: "joins a nested base url with a bare asset path",
        baseUrl: "/app",
        publicAssetPath: "img/logos/hono.svg",
        expected: "/app/img/logos/hono.svg"
      },
      {
        name: "joins an absolute origin with a leading-slash asset path",
        baseUrl: "https://example.com/",
        publicAssetPath: "/img/home/cta-avatar.png",
        expected: "https://example.com/img/home/cta-avatar.png"
      }
    ])("$name", ({ baseUrl, publicAssetPath, expected }) => {
      expect(resolvePublicAssetUrl(baseUrl, publicAssetPath)).toBe(expected);
    });
  });

  describe("fallback precedence and edge cases", () => {
    it.each([
      {
        name: "trims whitespace around both inputs before joining",
        baseUrl: "  /app/  ",
        publicAssetPath: "  /img/home/testimonials/shadcn.png  ",
        expected: "/app/img/home/testimonials/shadcn.png"
      },
      {
        name: "returns the normalized asset path when base url is blank",
        baseUrl: "   ",
        publicAssetPath: "/img/logos/heroui.png",
        expected: "/img/logos/heroui.png"
      },
      {
        name: "returns the normalized base url when asset path is blank",
        baseUrl: "/app/",
        publicAssetPath: "   ",
        expected: "/app"
      },
      {
        name: "falls back to root when both inputs are blank",
        baseUrl: "   ",
        publicAssetPath: "   ",
        expected: "/"
      }
    ])("$name", ({ baseUrl, publicAssetPath, expected }) => {
      expect(resolvePublicAssetUrl(baseUrl, publicAssetPath)).toBe(expected);
    });
  });

  describe("pathological inputs", () => {
    it.each([
      {
        name: "dedupes repeated trailing and leading slashes",
        baseUrl: "/app///",
        publicAssetPath: "///img/home/hero-screen-dark.webp",
        expected: "/app/img/home/hero-screen-dark.webp"
      },
      {
        name: "preserves interior double slashes inside the asset path",
        baseUrl: "/app/",
        publicAssetPath: "/img/home//hero-screen-dark.webp",
        expected: "/app/img/home//hero-screen-dark.webp"
      }
    ])("$name", ({ baseUrl, publicAssetPath, expected }) => {
      expect(resolvePublicAssetUrl(baseUrl, publicAssetPath)).toBe(expected);
    });
  });

  describe("contract invariants", () => {
    it("never emits a protocol-relative path when the base url is root", () => {
      const result = resolvePublicAssetUrl("/", "/img/home/hero-screen-light.webp");

      expect(result.startsWith("//")).toBe(false);
      expect(result).toBe("/img/home/hero-screen-light.webp");
    });

    it("always inserts exactly one separator between a non-empty base url and asset path", () => {
      const result = resolvePublicAssetUrl("/app/", "/img/logos/drizzle.ico");

      expect(result).toBe("/app/img/logos/drizzle.ico");
      expect(result.includes("/app//img")).toBe(false);
    });
  });
});
