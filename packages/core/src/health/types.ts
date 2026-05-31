import { z } from "zod";

// TODO: Extend these shared health contracts if the repo adds more health states or service metadata.
export const HEALTH_STATUSES = ["healthy", "unhealthy"] as const;

export const HealthStatusSchema = z.enum(HEALTH_STATUSES);

export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const BaseHealthSchema = z.object({
  buildSha: z.string().min(1),
  environment: z.string().min(1),
  status: HealthStatusSchema,
  timestamp: z.iso.datetime(),
  uptimeMs: z.number().int().nonnegative(),
  url: z.url()
});

export type BaseHealth = z.infer<typeof BaseHealthSchema>;

export const HealthCheckResultSchema = z
  .object({
    error: z.string().optional(),
    latencyMs: z.number().int().nonnegative(),
    status: HealthStatusSchema
  })
  .loose();

export type HealthCheckResult = z.infer<typeof HealthCheckResultSchema>;

export const HealthChecksSchema = z.record(z.string(), HealthCheckResultSchema);

export type HealthChecks = z.infer<typeof HealthChecksSchema>;

export const HealthLiveOutputSchema = BaseHealthSchema;

export type HealthLiveOutput = z.infer<typeof HealthLiveOutputSchema>;

export const HealthReadyOutputSchema = BaseHealthSchema.extend({
  checks: HealthChecksSchema
});

export type HealthReadyOutput = z.infer<typeof HealthReadyOutputSchema>;
