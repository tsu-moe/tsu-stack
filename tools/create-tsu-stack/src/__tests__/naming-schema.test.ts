import { describe, expect, it } from "vite-plus/test";

import { parseCliFlags } from "#@/args";
import {
  defaultDisplayName,
  normalizeProjectName,
  normalizeScope,
  projectNameFromDirectory
} from "#@/naming";
import { projectInputSchema } from "#@/schema";

describe("project identity", () => {
  it.each([
    ["My New App", "my-new-app"],
    ["  already_valid  ", "already_valid"],
    ["hello!!!world", "hello-world"]
  ])("normalizes %s to an npm-safe slug", (input, expected) => {
    expect(normalizeProjectName(input)).toBe(expected);
  });

  it("rejects reserved npm package names", () => {
    expect(() => normalizeProjectName("node_modules")).toThrow("Invalid project name");
  });

  it("derives display names, scopes, and nested destination names", () => {
    expect(defaultDisplayName("my-cool_app")).toBe("My Cool App");
    expect(normalizeScope("Cool Team")).toBe("@cool-team");
    expect(projectNameFromDirectory("projects/My App")).toBe("my-app");
  });
});

describe("CLI inputs", () => {
  it("keeps automation flags aligned with the shared schema", () => {
    const flags = parseCliFlags([
      "my-app",
      "--display-name",
      "My App",
      "--scope",
      "@acme",
      "--variant",
      "cloudflare",
      "--no-install",
      "--no-git",
      "--setup",
      "none",
      "--dry-run",
      "--yes"
    ]);

    expect(flags).toMatchObject({
      displayName: "My App",
      dryRun: true,
      noGit: true,
      noInstall: true,
      projectDirectory: "my-app",
      scope: "@acme",
      setup: "none",
      variant: "cloudflare",
      yes: true
    });
  });

  it("rejects local setup without installation", () => {
    expect(() =>
      projectInputSchema.parse({
        displayName: "My App",
        dryRun: false,
        git: false,
        install: false,
        projectDirectory: "my-app",
        projectName: "my-app",
        scope: "@my-app",
        setup: "local",
        variant: "separate"
      })
    ).toThrow("Guided setup requires dependency installation");
  });

  it("limits remote Cloudflare provisioning to the D1 variant", () => {
    expect(() =>
      projectInputSchema.parse({
        displayName: "My App",
        dryRun: false,
        git: false,
        install: true,
        projectDirectory: "my-app",
        projectName: "my-app",
        scope: "@my-app",
        setup: "cloudflare",
        variant: "cloudflare"
      })
    ).toThrow("Cloudflare provisioning is only available for the cloudflare-d1 variant");
  });

  it("rejects contradictory boolean flags", () => {
    expect(() => parseCliFlags(["app", "--install", "--no-install"])).toThrow(
      "Use either --install or --no-install"
    );
  });
});
