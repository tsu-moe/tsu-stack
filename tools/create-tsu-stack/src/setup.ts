import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { pathExists } from "fs-extra";

import { type CloudflareAccountPrompt, type ExistingD1Prompt } from "./cloudflare";
import { type CommandRunner, type ProjectInput, type SetupStep } from "./types";
import { VARIANTS } from "./variants";

export class SetupFailure extends Error {
  readonly recovery: readonly string[];

  constructor(label: string, recovery: readonly string[], cause: unknown) {
    super(`${label} failed. ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
    this.recovery = recovery;
  }
}

export async function assertSetupPrerequisites(input: ProjectInput, runner: CommandRunner, cwd: string): Promise<void> {
  if (input.install && !(await runner.succeeds("vp", ["--version"], cwd))) {
    throw new Error(
      "Vite Plus is required to install this template. Install it from https://vite.plus or use --no-install."
    );
  }
  if (input.git && !(await runner.succeeds("git", ["--version"], cwd))) {
    throw new Error("Git is required when --git is enabled. Install Git or use --no-git.");
  }
  if (
    input.setup === "local" &&
    input.variant !== "cloudflare-d1" &&
    !(await runner.succeeds("docker", ["version"], cwd))
  ) {
    throw new Error("Docker is required for guided PostgreSQL setup. Start Docker or use --setup none.");
  }
}

export async function createLocalEnvironment(projectRoot: string, input: ProjectInput): Promise<void> {
  const examplePath = join(projectRoot, "packages", "env", ".env.example");
  const envPath = join(projectRoot, "packages", "env", ".env");
  if (await pathExists(envPath)) return;
  const content = await readFile(examplePath, "utf8");
  const secret = randomBytes(32).toString("base64url");
  const serverUrl = input.variant === "separate" ? "http://localhost:5000/server" : "http://localhost:3000/web/server";
  const next = content
    .replace(/^VITE_SERVER_URL=.*$/mu, `VITE_SERVER_URL="${serverUrl}"`)
    .replace(/^VITE_WEB_URL=.*$/mu, 'VITE_WEB_URL="http://localhost:3000/web"')
    .replace(/^BETTER_AUTH_SECRET=.*$/mu, `BETTER_AUTH_SECRET="${secret}"`);
  // The file holds the generated auth secret and database URL: keep it readable by the owner only.
  await writeFile(envPath, next, { encoding: "utf8", flag: "wx", mode: 0o600 }).catch((error: unknown) => {
    if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) throw error;
  });
}

export async function runPostGeneration(
  projectRoot: string,
  input: ProjectInput,
  runner: CommandRunner,
  accountPrompt?: CloudflareAccountPrompt,
  existingD1Prompt?: ExistingD1Prompt,
  onStep?: (label: string) => void
): Promise<void> {
  const runStep: SetupStep = async (label, recovery, task) => {
    onStep?.(label);
    try {
      await task();
    } catch (error) {
      if (error instanceof Error && error.message === "CANCELLED") throw error;
      throw new SetupFailure(label, recovery, error);
    }
  };

  if (input.install) {
    await runStep("Install dependencies", ["vp install"], async () => runner.run("vp", ["install"], projectRoot));
  }
  if (input.setup !== "none") {
    await runStep("Create local environment", [], async () => createLocalEnvironment(projectRoot, input));
    await VARIANTS[input.variant].postGenerationHook({
      accountPrompt,
      existingD1Prompt,
      input,
      projectRoot,
      runner,
      runStep
    });
  }

  if (input.git) {
    await runStep("Initialize Git", ["git init"], async () => runner.run("git", ["init"], projectRoot));
  }
}
