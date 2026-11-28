import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, it } from "vite-plus/test";

const root = process.env.SCAFFOLD_PROJECT;

it.skipIf(!root)("generates the requested starter and keeps only downstream files", () => {
  const { SCAFFOLD_VARIANT: variant, SCAFFOLD_SOURCE_BRANCH: branch, TEMPLATE_SHA: commit } = process.env;
  expect(variant).toMatch(/^(separate|merged|cloudflare|cloudflare-d1)$/);
  expect(branch).toBeTruthy();
  expect(commit).toMatch(/^[a-f0-9]{40}$/);

  const exists = (path: string) => existsSync(join(root!, path));
  const read = (path: string) => readFileSync(join(root!, path), "utf8");
  expect(JSON.parse(read(".tsu-stack.jsonc"))).toMatchObject({
    source: { branch, commit },
    variant
  });

  const separate = variant === "separate";
  const cloudflare = variant === "cloudflare" || variant === "cloudflare-d1";
  const serverManifest = JSON.parse(read("apps/server/package.json"));
  const apiManifest = JSON.parse(read("packages/api/package.json"));
  const rootManifest = JSON.parse(read("package.json"));
  expect(Boolean(serverManifest.scripts?.build && serverManifest.scripts?.start)).toBe(separate);
  expect(exists("apps/web/src/routes/server")).toBe(!separate);

  const workerPath = "apps/web/wrangler.jsonc";
  expect(exists(workerPath)).toBe(cloudflare);
  const workerConfig = cloudflare ? read(workerPath) : "";
  expect(/"main": "src\/server\.ts"/.test(workerConfig)).toBe(cloudflare);
  expect(workerConfig.includes('"d1_databases"')).toBe(variant === "cloudflare-d1");

  const requiredPaths = [
    ".agents/skills/sync-template/SKILL.md",
    "apps/web/playwright.config.ts",
    "apps/web/__e2e__/home.spec.ts",
    "packages/api/vite.config.ts"
  ];
  const excludedPaths = [
    ".agents/cli.md",
    ".github/scripts/scaffold",
    "packages/api/src/routers/private/__tests__/index.test.ts",
    "packages/i18n/src/paraglide/runtime.js",
    "pnpm-lock.yaml",
    "tools/create-tsu-stack"
  ];
  expect(requiredPaths.filter((path) => !exists(path))).toEqual([]);
  expect(excludedPaths.filter(exists)).toEqual([]);

  expect(rootManifest.scripts.dev).toMatch(/^vp run i18n:ensure && /);
  expect(apiManifest.scripts["test:unit"]).toBe("vp test");
});
