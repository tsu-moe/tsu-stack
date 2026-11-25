import { expect, it } from "vite-plus/test";

import { resolvePublicAssetUrl } from "#@/assets/utils";

it("keeps a root asset path same-origin when it starts with multiple slashes", () => {
  expect(resolvePublicAssetUrl("/", "//example.test/image.png")).toBe("/example.test/image.png");
});
