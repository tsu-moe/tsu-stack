import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { pathExists } from "fs-extra";
import { describe, expect, it } from "vite-plus/test";

import { transformTemplate } from "#@/transform";
import { type ProjectInput, type ResolvedTemplate } from "#@/types";

const input: ProjectInput = {
  displayName: "Moon Garden",
  dryRun: false,
  git: false,
  install: false,
  projectDirectory: "moon-garden",
  projectName: "moon-garden",
  scope: "@moon-garden",
  setup: "none",
  variant: "cloudflare-d1"
};

const template: ResolvedTemplate = {
  branch: "variant/merged-cloudflare-d1",
  commit: "a".repeat(40),
  requestedRef: "variant/merged-cloudflare-d1",
  variant: "cloudflare-d1"
};

async function fixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "create-tsu-stack-transform-"));
  const files: Record<string, string> = {
    ".github/README.md": '<a href="upstream">tsu!stack</a> alt="tsu!stack Logo"',
    ".github/workflows/ci.yml": "template maintainer CI",
    ".github/workflows/release.yml": "template package release",
    ".agents/cli.md": "Generator maintainer instructions",
    "AGENTS.md": "# tsu-stack\nUse @tsu-stack/core.",
    "apps/web/src/config/app.config.ts":
      'export const app = { longName: "The tsu!stack", shortName: "tsu!stack" }',
    "apps/web/wrangler.jsonc":
      '{\n  // Worker identity\n  "name": "tsu-stack",\n  "d1_databases": [{ "binding": "DB", "database_name": "tsu-stack-db", "database_id": "00000000-0000-0000-0000-000000000000" }]\n}\n',
    "docker-compose.yaml": "name: tsu-stack\nvolumes:\n  tsu-stack-data:\n",
    "package.json":
      '{"name":"tsu-stack","private":true,"type":"module","scripts":{"release":"node tools/create-tsu-stack/scripts/release.mjs"},"dependencies":{"@react/example":"1.0.0","@tsu-stack/core":"workspace:*"}}',
    "packages/env/.env.example":
      'DATABASE_URL="postgres://postgres:postgres@localhost:5432/tsu-stack"\nVITE_SERVER_URL="http://localhost:5000/server"\n',
    "packages/i18n/messages/de.json": '{"name":"tsu-stack"}',
    "packages/i18n/messages/en.json": '{"name":"tsu-stack"}',
    "pnpm-lock.yaml": "lockfileVersion: 9",
    "tools/create-tsu-stack/package.json": '{"name":"create-tsu-stack"}'
  };
  for (const [relativePath, content] of Object.entries(files)) {
    const path = join(root, relativePath);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
  }
  return root;
}

describe("template identity transformation", () => {
  it("rewrites the allowlisted project identity and records provenance", async () => {
    const root = await fixture();
    await transformTemplate(root, input, template, "1.2.3");

    expect(await pathExists(join(root, "tools/create-tsu-stack"))).toBe(false);
    expect(await pathExists(join(root, ".agents/cli.md"))).toBe(false);
    expect(await pathExists(join(root, ".github/workflows/release.yml"))).toBe(false);
    expect(await pathExists(join(root, "pnpm-lock.yaml"))).toBe(false);
    const packageJsonContent = await readFile(join(root, "package.json"), "utf8");
    const packageJson = JSON.parse(packageJsonContent);
    expect(packageJson).toMatchObject({
      name: "moon-garden",
      dependencies: { "@moon-garden/core": "workspace:*" }
    });
    expect(packageJson).not.toHaveProperty("scripts.release");
    expect(Object.keys(packageJson)).toEqual([
      "name",
      "private",
      "type",
      "scripts",
      "dependencies"
    ]);
    expect(Object.keys(packageJson.dependencies)).toEqual(["@moon-garden/core", "@react/example"]);
    const generatedCi = await readFile(join(root, ".github/workflows/ci.yml"), "utf8");
    const generatedCiSteps = [
      "pnpm exec vp run check",
      "pnpm exec vp run test:unit:run",
      "pnpm exec vp exec playwright install --with-deps chromium",
      "pnpm exec vp run test:e2e:run",
      "pnpm exec vp run build"
    ];
    const generatedCiStepIndexes = generatedCiSteps.map((step) => generatedCi.indexOf(step));
    expect(generatedCiStepIndexes).not.toContain(-1);
    const generatedCiStepsAreOrdered = generatedCiStepIndexes
      .slice(1)
      .every(
        (stepIndex, index) =>
          stepIndex > (generatedCiStepIndexes[index] ?? Number.POSITIVE_INFINITY)
      );
    expect(generatedCiStepsAreOrdered).toBe(true);
    expect(generatedCi).toContain("working-directory: apps/web");
    expect(generatedCi).not.toContain("create-tsu-stack");
    expect(await readFile(join(root, "apps/web/wrangler.jsonc"), "utf8")).toContain(
      '"name": "moon-garden"'
    );
    expect(await readFile(join(root, "apps/web/wrangler.jsonc"), "utf8")).toContain(
      '"database_name": "moon-garden-db"'
    );
    expect(await readFile(join(root, "docker-compose.yaml"), "utf8")).not.toContain("tsu-stack");
    expect(await readFile(join(root, "packages/env/.env.example"), "utf8")).toContain(
      "http://localhost:3000/web/server"
    );

    const metadata = JSON.parse(await readFile(join(root, ".tsu-stack.jsonc"), "utf8"));
    expect(metadata).toMatchObject({
      cliVersion: "1.2.3",
      displayName: "Moon Garden",
      scope: "@moon-garden",
      source: { commit: "a".repeat(40) },
      variant: "cloudflare-d1"
    });
    expect(metadata.reproducibleCommand).toContain(`--ref ${"a".repeat(40)}`);
    expect(await readFile(join(root, ".github/README.md"), "utf8")).toContain('href="upstream"');
  });
});
