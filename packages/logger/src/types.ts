import { z } from "zod";

const identifier = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[\w.-]+$/);
export const LogNameSchema = z
  .string()
  .max(96)
  .regex(/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/);
export const BrowserLogFieldsSchema = z.object({
  event: LogNameSchema.optional(),
  error: z
    .object({
      name: z
        .string()
        .pipe(
          z
            .enum(["Error", "TypeError", "RangeError", "ReferenceError", "SyntaxError", "AbortError", "AggregateError"])
            .catch("Error")
        )
    })
    .optional(),
  status: z.number().int().min(100).max(599).optional(),
  user: z.object({ id: identifier }).optional()
});

export const BrowserLogPayloadSchema = z.object({
  event: BrowserLogFieldsSchema.extend({
    environment: identifier.max(32),
    level: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).catch("info"),
    service: identifier.max(64),
    timestamp: z.iso.datetime().max(40)
  }),
  request: z
    .object({
      requestId: z
        .string()
        .min(1)
        .max(255)
        .regex(/^[\w-=]+$/)
        .optional()
    })
    .optional()
});

export type LogName = `${string}.${string}`;
export type BrowserLogInput = Omit<z.input<typeof BrowserLogFieldsSchema>, "user"> & { event: LogName };
export type BrowserLogPayload = z.output<typeof BrowserLogPayloadSchema>;
