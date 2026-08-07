#!/usr/bin/env node

import { resolve } from "node:path";

import * as p from "@clack/prompts";

import { HELP_TEXT, parseCliFlags } from "./args";
import { commandRunner } from "./commands";
import { assertDestinationAvailable, generateProject } from "./generate";
import { resolveTemplate } from "./github";
import { collectProjectInput, finishPrompt } from "./prompts";
import { assertSetupPrerequisites, runPostGeneration } from "./setup";
import { buildReproducibleCommand } from "./transform";
import { getCliVersion } from "./version";

async function withSpinner<T>(start: string, done: string, task: () => Promise<T>): Promise<T> {
  const spinner = p.spinner();
  spinner.start(start);
  try {
    const result = await task();
    spinner.stop(done);
    return result;
  } catch (error) {
    spinner.stop(`${start} failed`);
    throw error;
  }
}

async function main(): Promise<void> {
  const flags = parseCliFlags(process.argv.slice(2));
  const cliVersion = await getCliVersion();

  if (flags.help) {
    process.stdout.write(HELP_TEXT);
    return;
  }
  if (flags.version) {
    process.stdout.write(`${cliVersion}\n`);
    return;
  }

  const cwd = process.cwd();
  const input = await collectProjectInput(flags);
  const template = await withSpinner(
    `Resolving ${input.variant} template`,
    "Template resolved",
    async () => resolveTemplate(input)
  );
  const target = resolve(cwd, input.projectDirectory);
  await assertDestinationAvailable(target);

  const reproducibleCommand = buildReproducibleCommand(input, template);
  if (input.dryRun) {
    p.note(
      [
        `Destination: ${target}`,
        `Variant: ${input.variant} (${template.branch})`,
        `Commit: ${template.commit}`,
        `Scope: ${input.scope}`,
        `Install: ${input.install ? "yes" : "no"}`,
        `Setup: ${input.setup}`,
        `Git: ${input.git ? "yes" : "no"}`,
        "",
        `Replay: ${reproducibleCommand}`
      ].join("\n"),
      "Dry run"
    );
    finishPrompt("No files or external resources were changed.");
    return;
  }

  await assertSetupPrerequisites(input, commandRunner, cwd);
  const generatedRoot = await withSpinner(
    "Downloading and transforming the template",
    "Project files generated",
    async () => generateProject({ cliVersion, cwd, input, template })
  );

  await runPostGeneration(generatedRoot, input, commandRunner);

  const nextSteps = [
    `cd ${JSON.stringify(input.projectDirectory)}`,
    ...(!input.install ? ["vp install"] : []),
    ...(input.setup === "none"
      ? input.variant === "cloudflare-d1"
        ? [
            "Copy packages/env/.env.example to packages/env/.env",
            "vp run db:migrate:local",
            "# Optional remote setup: vp exec wrangler login, then follow .github/README.md"
          ]
        : [
            "Copy packages/env/.env.example to packages/env/.env",
            "vp run db:dev:start",
            "vp run db:migrate"
          ]
      : []),
    "vp run dev"
  ];
  p.note(`${nextSteps.join("\n")}\n\nReplay: ${reproducibleCommand}`, "Next steps");
  finishPrompt(`${input.displayName} is ready.`);
}

try {
  await main();
} catch (error) {
  if (error instanceof Error && error.message === "CANCELLED") process.exitCode = 0;
  else {
    p.log.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
