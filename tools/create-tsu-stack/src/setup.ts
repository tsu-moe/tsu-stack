import { randomBytes } from "node:crypto";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { pathExists } from "fs-extra";

import { type CommandRunner, type ProjectInput } from "./types";
import { VARIANTS } from "./variants";

export async function assertSetupPrerequisites(
  input: ProjectInput,
  runner: CommandRunner,
  cwd: string
): Promise<void> {
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
    throw new Error(
      "Docker is required for guided PostgreSQL setup. Start Docker or use --setup none."
    );
  }
}

export async function createLocalEnvironment(
  projectRoot: string,
  input: ProjectInput
): Promise<void> {
  const examplePath = join(projectRoot, "packages", "env", ".env.example");
  const envPath = join(projectRoot, "packages", "env", ".env");
  if (!(await pathExists(envPath))) await copyFile(examplePath, envPath);

  const content = await readFile(envPath, "utf8");
  const secret = randomBytes(32).toString("base64url");
  const serverUrl =
    input.variant === "separate"
      ? "http://localhost:5000/server"
      : "http://localhost:3000/web/server";
  const next = content
    .replace(/^VITE_SERVER_URL=.*$/mu, `VITE_SERVER_URL="${serverUrl}"`)
    .replace(/^VITE_WEB_URL=.*$/mu, 'VITE_WEB_URL="http://localhost:3000/web"')
    .replace(/^BETTER_AUTH_SECRET=.*$/mu, `BETTER_AUTH_SECRET="${secret}"`);
  await writeFile(envPath, next, "utf8");
}

export async function runPostGeneration(
  projectRoot: string,
  input: ProjectInput,
  runner: CommandRunner
): Promise<void> {
  if (input.install) await runner.run("vp", ["install"], projectRoot);

  if (input.setup !== "none") {
    await createLocalEnvironment(projectRoot, input);
    await VARIANTS[input.variant].postGenerationHook({ input, projectRoot, runner });
  }

  if (input.git) await runner.run("git", ["init"], projectRoot);
}
