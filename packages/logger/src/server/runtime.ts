import { type AuditInput as EvlogAuditInput, type AuditableLogger } from "evlog";

import { LogNameSchema, type LogName } from "#@/types";

type LogValue = string | number | bigint | boolean | null | undefined | LogObject | readonly LogValue[];
type LogObject = { [key: string]: LogValue };
export type LogFields = LogObject & { operation?: LogName };

export type AuditInput = EvlogAuditInput & { action: LogName; outcome: NonNullable<EvlogAuditInput["outcome"]> };
type AuditSubject = Omit<AuditInput, "outcome" | "reason">;

type JsonValue = string | number | boolean | null | JsonFields | JsonValue[];
type JsonFields = { [key: string]: JsonValue | undefined };

const reservedFields = new Set([
  "audit",
  "event",
  "source",
  "service",
  "environment",
  "version",
  "commitHash",
  "region",
  "requestId",
  "hostname",
  "path",
  "method",
  "status",
  "timestamp",
  "level",
  "duration",
  "durationMs",
  "_forceKeep",
  "_durationMs",
  "_auditForceKeep"
]);
const unsafeKeys = new Set(["__proto__", "constructor", "prototype"]);
let lastFailureAt: number | undefined;

export function reportLoggingFailure() {
  const now = Date.now();
  if (lastFailureAt !== undefined && now - lastFailureAt < 60_000) return;
  lastFailureAt = now;
  // oxlint-disable-next-line eslint/no-console
  console.error("[tsu-stack/logger] Failed to record telemetry");
}

export function logSafely<T>(write: () => T): T | undefined {
  try {
    return write();
  } catch {
    reportLoggingFailure();
  }
}

function jsonValue(value: unknown, depth: number, budget: { remaining: number }): JsonValue | undefined {
  if (depth > 6 || budget.remaining-- <= 0) return;
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "string") return value.slice(0, 4096);
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value === null || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.slice(0, 32).map((item) => jsonValue(item, depth + 1, budget) ?? null);
  }
  if (typeof value !== "object") return;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype) return;

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 64)
      .filter(([key]) => !unsafeKeys.has(key))
      .map(([key, field]) => [key, jsonValue(field, depth + 1, budget)])
  );
}

function logFields(fields: LogFields): JsonFields {
  const budget = { remaining: 128 };
  return Object.fromEntries(
    Object.keys(fields)
      .slice(0, 64)
      .filter((key) => !reservedFields.has(key) && !unsafeKeys.has(key))
      .filter((key) => key !== "operation" || LogNameSchema.safeParse(fields.operation).success)
      .map((key) => [key, jsonValue(fields[key], 0, budget)])
  );
}

export function normalizeAudit(input: AuditInput): EvlogAuditInput {
  const { target, changes } = input;
  const budget = { remaining: 128 };
  return {
    ...input,
    action: LogNameSchema.parse(input.action),
    ...(target && { target: { ...(jsonValue(target, 0, budget) as JsonFields), id: target.id, type: target.type } }),
    ...(changes && {
      changes: {
        before: jsonValue(changes.before, 0, budget),
        after: jsonValue(changes.after, 0, budget),
        ...(changes.patch && {
          patch: changes.patch.slice(0, 32).map((entry) => {
            return {
              ...entry,
              ...("value" in entry && { value: jsonValue(entry.value, 0, budget) })
            };
          })
        })
      }
    })
  };
}

export function requestLogger(logger: AuditableLogger) {
  const audit = (input: AuditInput) => {
    logSafely(() => logger.audit(normalizeAudit(input)));
  };
  return {
    set(fields: LogFields) {
      logSafely(() => logger.set(logFields(fields)));
    },
    error(error: unknown, fields?: LogFields) {
      const diagnostic = error instanceof Error || typeof error === "string" ? error : "A non-Error value was thrown";
      logSafely(() => {
        if (fields) logger.error(diagnostic, logFields(fields));
        else logger.error(diagnostic);
      });
    },
    outcome(event: LogName, fields?: LogFields) {
      logSafely(() => logger.set({ ...(fields && logFields(fields)), event: LogNameSchema.parse(event) }));
    },
    audit: Object.assign(audit, {
      deny(reason: string, input: AuditSubject) {
        audit({ ...input, reason, outcome: "denied" });
      }
    })
  };
}

export type RequestLogger = ReturnType<typeof requestLogger>;

export function standaloneLogger(logger: AuditableLogger, fields?: LogFields) {
  const scoped = requestLogger(logger);
  if (fields) scoped.set(fields);
  return {
    ...scoped,
    emit() {
      return logSafely(() => logger.emit({ _forceKeep: typeof logger.getContext().event === "string" })) ?? null;
    }
  };
}
