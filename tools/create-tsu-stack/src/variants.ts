import { provisionD1 } from "./cloudflare";
import { type CommandRunner, type ProjectInput, type VariantName } from "./types";

type VariantTransformHook = {
  d1Database: boolean;
  mergedLocalServer: boolean;
  workerName: boolean;
};

type PostGenerationContext = {
  input: ProjectInput;
  projectRoot: string;
  runner: CommandRunner;
};

async function setupPostgres({ projectRoot, runner }: PostGenerationContext): Promise<void> {
  await runner.run("vp", ["run", "db:dev:start"], projectRoot);
  await runner.run("vp", ["run", "db:migrate"], projectRoot);
}

async function setupD1(context: PostGenerationContext): Promise<void> {
  if (context.input.setup === "cloudflare") {
    await provisionD1(context.projectRoot, context.input, context.runner);
    return;
  }
  await context.runner.run("vp", ["run", "db:migrate:local"], context.projectRoot);
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
