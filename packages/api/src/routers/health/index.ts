import process from "node:process";

import { z } from "zod";

import { checkIsDbReady } from "@tsu-stack/db";
import { ENV_SERVER } from "@tsu-stack/env/server/env";

import { publicProcedure } from "#@/lib/procedures/factory";

// #region Config

const HEALTHCHECK_TIMEOUT_MS = 1_500;

// #region Utils

const CheckResultSchema = z
  .object({
    error: z.string().optional(),
    latencyMs: z.number(),
    status: z.enum(["healthy", "unhealthy"]),
  })
  .loose();

type CheckResult = z.infer<typeof CheckResultSchema>;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function runCheck(check: () => Promise<object>): Promise<CheckResult> {
  const startedAt = performance.now();
  try {
    const data = await withTimeout(check(), HEALTHCHECK_TIMEOUT_MS);
    const latencyMs = Math.round(performance.now() - startedAt);
    const result = data as { status?: string };
    if (result.status === "unhealthy") return { ...data, latencyMs, status: "unhealthy" };
    return { ...data, latencyMs, status: "healthy" };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      latencyMs: Math.round(performance.now() - startedAt),
      status: "unhealthy",
    };
  }
}

function buildBaseHealth() {
  return {
    buildSha: ENV_SERVER.SOURCE_COMMIT,
    environment: ENV_SERVER.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeMs: Math.floor(process.uptime() * 1000),
    url: ENV_SERVER.VITE_SERVER_URL,
  };
}

// #region Service Checks
async function checkDatabase() {
  const isReady = await checkIsDbReady();
  return { status: isReady ? "healthy" : "unhealthy" };
}

// TODO: Add future checks here with their corresponding functions, ex: { redis: checkRedis, ... }
const serviceChecks = {
  database: checkDatabase,
} satisfies Record<string, () => Promise<object>>;

// #region Router

export const healthRouter = {
  live: publicProcedure
    .route({
      description: "Check if the server is alive",
      method: "GET",
      spec: (spec) => {
        return { ...spec, security: [] };
      },
    })
    .errors({})
    .handler(() => {
      return { status: "healthy", ...buildBaseHealth() };
    }),
  ready: publicProcedure
    .route({
      description:
        "Check if the server is ready to handle requests and connect to external services",
      method: "GET",
      spec: (spec) => {
        return { ...spec, security: [] };
      },
    })
    .errors({
      SERVICE_UNAVAILABLE: {
        data: z.object({
          checks: z.record(z.string(), CheckResultSchema),
        }),
        description: "One or more services are unhealthy",
        status: 503,
      },
    })
    .handler(async ({ errors }) => {
      const entries = await Promise.all(
        Object.entries(serviceChecks).map(async ([name, check]) => [name, await runCheck(check)]),
      );
      const checks = Object.fromEntries(entries) as Record<string, CheckResult>;
      const allHealthy = Object.values(checks).every((r) => r.status === "healthy");

      if (!allHealthy) {
        throw errors.SERVICE_UNAVAILABLE({ data: { checks } });
      }

      return {
        status: "healthy" as const,
        ...buildBaseHealth(),
        checks,
      };
    }),
};
