#!/usr/bin/env node

import { resolve } from "node:path";

import * as p from "@clack/prompts";

import { HELP_TEXT, parseCliFlags } from "./args";
import { commandRunner } from "./commands";
import { generateProject } from "./generate";
import { resolveTemplate } from "./github";
import { buildNextSteps, changeDirectoryCommand } from "./next-steps";
import { collectProjectInput, finishPrompt } from "./prompts";
import { assertSetupPrerequisites, runPostGeneration, SetupFailure } from "./setup";
import { buildReproducibleCommand } from "./transform";
import { getCliVersion } from "./version";

async function withSpinner<T>(interactive: boolean, start: string, done: string, task: () => Promise<T>): Promise<T> {
  if (!interactive) {
    process.stdout.write(`${start}...\n`);
    return task();
  }
  const spinner = p.spinner();
  spinner.start(start);
  try {
    const result = await task();
    spinner.stop(done);
    return result;
  } catch (error) {
    spinner.error();
    throw error;
  }
}

function showNote(interactive: boolean, title: string, body: string): void {
  if (interactive) p.note(body, title);
  else process.stdout.write(`\n${title}\n${body}\n`);
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
  const hasTerminal = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  if (!hasTerminal && !flags.yes) {
    throw new Error("Without an interactive terminal, provide a project directory and --yes. See --help for options.");
  }
  const interactive = hasTerminal && !flags.yes;
  const input = await collectProjectInput(flags);
  if (!input.dryRun) {
    if (input.setup === "cloudflare" && !hasTerminal) {
      throw new Error(
        "Cloudflare setup needs a terminal to choose the account. Use --setup local or --setup none in scripts."
      );
    }
    await assertSetupPrerequisites(input, commandRunner, cwd);
  }
  const template = await withSpinner(
    interactive,
    `Resolving ${input.variant} template`,
    "Template resolved",
    async () => resolveTemplate(input)
  );
  const target = resolve(cwd, input.projectDirectory);

  if (input.dryRun) {
    showNote(
      interactive,
      "Dry run",
      [
        `Destination: ${target}`,
        `Variant: ${input.variant} (${template.branch})`,
        `Commit: ${template.commit}`,
        `Scope: ${input.scope}`,
        `Install: ${input.install ? "yes" : "no"}`,
        `Setup: ${input.setup}`,
        `Git: ${input.git ? "yes" : "no"}`,
        "",
        "Replay command (POSIX shell):",
        buildReproducibleCommand(input, template, cliVersion)
      ].join("\n")
    );
    if (interactive) finishPrompt("No files or external resources were changed.");
    return;
  }

  const generatedRoot = await withSpinner(
    interactive,
    "Downloading and transforming the template",
    "Project files generated",
    async () => generateProject({ cliVersion, cwd, input, template })
  );

  try {
    await runPostGeneration(generatedRoot, input, commandRunner, undefined, undefined, (label) => {
      if (interactive) p.log.step(label);
      else process.stdout.write(`${label}...\n`);
    });
  } catch (error) {
    if (!(error instanceof SetupFailure)) {
      if (error instanceof Error && error.message === "CANCELLED") {
        showNote(interactive, "Project files are ready", `${generatedRoot}\nSee .github/README.md to continue setup.`);
      }
      throw error;
    }
    process.stderr.write(
      [
        `Error: ${error.message}`,
        `Project files were kept at ${generatedRoot}.`,
        "",
        "Continue in the generated project:",
        changeDirectoryCommand(generatedRoot),
        ...error.recovery,
        "See .github/README.md for the remaining setup steps.",
        ""
      ].join("\n")
    );
    process.exitCode = 1;
    return;
  }

  showNote(interactive, "Next steps", buildNextSteps(input));
  const success = input.install
    ? `${input.displayName} was created.`
    : `Created ${input.displayName}. Install dependencies to get started.`;
  if (interactive) finishPrompt(success);
  else process.stdout.write(`\n${success}\n`);
}

try {
  await main();
} catch (error) {
  if (error instanceof Error && error.message === "CANCELLED") process.exitCode = 0;
  else {
    process.stderr.write(`Error: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
