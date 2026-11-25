import { type CloudflareAccountPrompt, type ExistingD1Prompt, provisionD1 } from "./cloudflare";
import { type CommandRunner, type ProjectInput, type SetupStep, type VariantName } from "./types";

type VariantTransformHook = {
  d1Database: boolean;
  mergedLocalServer: boolean;
  workerName: boolean;
};

type PostGenerationContext = {
  accountPrompt?: CloudflareAccountPrompt;
  existingD1Prompt?: ExistingD1Prompt;
  input: ProjectInput;
  projectRoot: string;
  runner: CommandRunner;
  runStep: SetupStep;
};

async function setupPostgres({ projectRoot, runner, runStep }: PostGenerationContext): Promise<void> {
  await runStep("Start local PostgreSQL", ["vp run db:dev:start", "vp run db:migrate"], async () =>
    runner.run("vp", ["run", "db:dev:start"], projectRoot)
  );
  await runStep("Apply PostgreSQL migrations", ["vp run db:migrate"], async () =>
    runner.run("vp", ["run", "db:migrate"], projectRoot)
  );
}

async function setupD1({
  input,
  projectRoot,
  runner,
  runStep,
  accountPrompt,
  existingD1Prompt
}: PostGenerationContext): Promise<void> {
  if (input.setup === "cloudflare") {
    await runStep("Set up remote D1", [], async () =>
      provisionD1(projectRoot, input, runner, accountPrompt, existingD1Prompt)
    );
  }
  await runStep("Apply local D1 migrations", ["vp run db:migrate:local"], async () =>
    runner.run("vp", ["run", "db:migrate:local"], projectRoot)
  );
}

export type VariantDefinition = {
  branch: string;
  description: string;
  merged: boolean;
  name: VariantName;
  postGenerationHook: (context: PostGenerationContext) => Promise<void>;
  transformHook: VariantTransformHook;
};

export const VARIANTS = {
  separate: {
    branch: "main",
    description: "Separate TanStack Start web and Node/Hono server apps",
    merged: false,
    name: "separate",
    postGenerationHook: setupPostgres,
    transformHook: { d1Database: false, mergedLocalServer: false, workerName: false }
  },
  merged: {
    branch: "variant/merged",
    description: "Merged web and Hono server with the Node deployment",
    merged: true,
    name: "merged",
    postGenerationHook: setupPostgres,
    transformHook: { d1Database: false, mergedLocalServer: true, workerName: false }
  },
  cloudflare: {
    branch: "variant/merged-cloudflare",
    description: "Merged web and Hono server for Cloudflare Workers",
    merged: true,
    name: "cloudflare",
    postGenerationHook: setupPostgres,
    transformHook: { d1Database: false, mergedLocalServer: true, workerName: true }
  },
  "cloudflare-d1": {
    branch: "variant/merged-cloudflare-d1",
    description: "Merged Cloudflare Worker with a local or provisioned D1 database",
    merged: true,
    name: "cloudflare-d1",
    postGenerationHook: setupD1,
    transformHook: { d1Database: true, mergedLocalServer: true, workerName: true }
  }
} as const satisfies Record<VariantName, VariantDefinition>;
