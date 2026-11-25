import { type ProjectInput } from "./types";

type NextStepsInput = Pick<ProjectInput, "install" | "projectDirectory" | "setup" | "variant">;

export function changeDirectoryCommand(directory: string, platform = process.platform): string {
  return platform === "win32"
    ? `Set-Location -LiteralPath '${directory.replaceAll("'", "''")}'`
    : `cd -- '${directory.replaceAll("'", "'\\''")}'`;
}

export function buildNextSteps(input: NextStepsInput, platform = process.platform): string {
  const createEnv =
    platform === "win32"
      ? "Copy-Item packages/env/.env.example packages/env/.env"
      : "cp packages/env/.env.example packages/env/.env";
  const commands = [
    ...(input.projectDirectory === "." ? [] : [changeDirectoryCommand(input.projectDirectory, platform)]),
    ...(!input.install ? ["vp install"] : []),
    ...(input.setup === "none"
      ? input.variant === "cloudflare-d1"
        ? [createEnv, "vp run db:migrate:local"]
        : [createEnv, "vp run db:dev:start", "vp run db:migrate"]
      : []),
    "vp run dev"
  ];

  if (input.variant === "cloudflare-d1" && input.setup !== "cloudflare") {
    commands.push("", "OPTIONAL:", "vp exec wrangler login", "# Follow .github/README.md for remote setup");
  }

  return commands.join("\n");
}
