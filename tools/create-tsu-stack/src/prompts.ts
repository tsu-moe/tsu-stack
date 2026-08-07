import * as p from "@clack/prompts";

import { commandRunner } from "./commands";
import {
  defaultDisplayName,
  normalizeProjectName,
  normalizeScope,
  projectNameFromDirectory
} from "./naming";
import { projectInputSchema } from "./schema";
import {
  type CliFlags,
  type CommandRunner,
  type ProjectInput,
  type SetupMode,
  type VariantName
} from "./types";
import { VARIANTS } from "./variants";

function unwrap<T>(value: symbol | T): T {
  if (p.isCancel(value)) {
    p.cancel("Project creation cancelled.");
    throw new Error("CANCELLED");
  }
  return value;
}

export async function collectProjectInput(
  flags: CliFlags,
  runner: CommandRunner = commandRunner,
  cwd = process.cwd()
): Promise<ProjectInput> {
  if (flags.yes && !flags.projectDirectory) {
    throw new Error("A project directory is required when using --yes.");
  }

  p.intro("create-tsu-stack");

  const projectDirectory =
    flags.projectDirectory ??
    unwrap(
      await p.text({
        message: "Where should the project be created?",
        placeholder: "my-tsu-app",
        validate: (value) => {
          try {
            normalizeProjectName(value ?? "");
          } catch (error) {
            return error instanceof Error ? error.message : String(error);
          }
        }
      })
    );

  const projectName = projectNameFromDirectory(projectDirectory);
  const suggestedDisplayName = defaultDisplayName(projectName);

  const displayName =
    flags.displayName ??
    (flags.yes
      ? suggestedDisplayName
      : unwrap(
          await p.text({
            defaultValue: suggestedDisplayName,
            message: "What is the application display name?",
            placeholder: suggestedDisplayName
          })
        ));

  const suggestedScope = `@${projectName}`;
  const scope = normalizeScope(
    flags.scope ??
      (flags.yes
        ? suggestedScope
        : unwrap(
            await p.text({
              defaultValue: suggestedScope,
              message: "What workspace package scope should be used?",
              placeholder: suggestedScope
            })
          ))
  );

  const variant = (flags.variant ??
    (flags.yes
      ? "separate"
      : unwrap(
          await p.select({
            message: "Choose a deployment variant",
            options: Object.values(VARIANTS).map((definition) => {
              return {
                hint: definition.description,
                label: definition.name,
                value: definition.name
              };
            })
          })
        ))) as VariantName;

  const install = flags.noInstall
    ? false
    : (flags.install ??
      (flags.yes
        ? true
        : unwrap(
            await p.confirm({ initialValue: true, message: "Install dependencies with Vite Plus?" })
          )));

  let promptedSetup: SetupMode = "none";
  if (!flags.setup && !flags.yes && install) {
    if (variant === "cloudflare-d1") {
      promptedSetup = unwrap(
        await p.select({
          initialValue: "none",
          message: "Configure the D1 database now?",
          options: [
            { label: "No, print the commands", value: "none" },
            { label: "Set up a local D1 database", value: "local" },
            {
              hint: "requires Wrangler login",
              label: "Set up local and remote D1 databases",
              value: "cloudflare"
            }
          ]
        })
      ) as SetupMode;
    } else {
      const dockerAvailable = flags.dryRun
        ? true
        : await runner.succeeds("docker", ["version"], cwd);
      if (!dockerAvailable) {
        p.log.warn("Docker is unavailable, so guided local database setup has been disabled.");
      } else {
        promptedSetup = unwrap(
          await p.select({
            initialValue: "none",
            message: "Run guided local environment and database setup?",
            options: [
              { label: "No, print the commands", value: "none" },
              { label: "Yes, configure env and PostgreSQL", value: "local" }
            ]
          })
        ) as SetupMode;
      }
    }
  }
  const setup = (flags.setup ?? promptedSetup) as SetupMode;

  const git = flags.noGit
    ? false
    : (flags.git ??
      (flags.yes
        ? true
        : unwrap(
            await p.confirm({ initialValue: true, message: "Initialize a Git repository?" })
          )));

  return projectInputSchema.parse({
    displayName,
    dryRun: flags.dryRun ?? false,
    git,
    install,
    projectDirectory,
    projectName,
    ref: flags.ref,
    scope,
    setup,
    variant
  });
}

export function finishPrompt(message: string): void {
  p.outro(message);
}
