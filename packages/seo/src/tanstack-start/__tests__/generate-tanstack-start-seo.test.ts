import { expect, it } from "vite-plus/test";

import { generateTanStackStartSeo } from "#@/tanstack-start/generate-tanstack-start-seo";

it("preserves a route's explicit crawler restrictions", () => {
  const head = generateTanStackStartSeo({
    robots: { index: false, follow: false, noarchive: true },
    site: { baseUrl: "https://example.test", defaultTitle: "Example" }
  });

  expect(head.meta).toEqual(
    expect.arrayContaining([
      { content: "noindex, nofollow, noarchive", name: "robots" },
      { content: "noindex, nofollow, noarchive", name: "googlebot" }
    ])
  );
});
