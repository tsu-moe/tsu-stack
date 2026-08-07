import { type ProjectInput } from "./types";

type NextStepsInput = Pick<ProjectInput, "install" | "projectDirectory" | "setup" | "variant">;

export function buildNextSteps(input: NextStepsInput): string {
  const commands = [
    `cd ${JSON.stringify(input.projectDirectory)}`,
    ...(!input.install ? ["vp install"] : []),
    ...(input.setup === "none"
      ? input.variant === "cloudflare-d1"
        ? ["cp packages/env/.env.example packages/env/.env", "vp run db:migrate:local"]
        : [
            "cp packages/env/.env.example packages/env/.env",
            "vp run db:dev:start",
            "vp run db:migrate"
          ]
      : []),
    "vp run dev"
  ];

  if (input.variant === "cloudflare-d1" && input.setup !== "cloudflare") {
    commands.push(
      "",
      "OPTIONAL:",
      "vp exec wrangler login",
      "# Follow .github/README.md for remote setup"
    );
  }

  return commands.join("\n");
}
