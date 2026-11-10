import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { type ClientIpVariables } from "#@/shared/lib/client-ip";

type RateLimitOptions = {
  limit: number;
  maxKeys?: number;
  windowMs: number;
};

type Window = {
  count: number;
  resetAt: number;
};

export function fixedWindowRateLimit({ limit, maxKeys = 10_000, windowMs }: RateLimitOptions) {
  const windows = new Map<string, Window>();
  let nextCleanupAt = 0;

  return createMiddleware<{ Variables: ClientIpVariables }>(async (c, next) => {
    const now = Date.now();
    if (now >= nextCleanupAt) {
      for (const [key, window] of windows) {
        if (window.resetAt <= now) windows.delete(key);
      }
      nextCleanupAt = now + windowMs;
    }

    let key = c.get("clientIp") || "unknown";
    if (!windows.has(key) && windows.size >= maxKeys) key = "overflow";

    const current = windows.get(key);
    const window = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
    window.count += 1;
    windows.set(key, window);

    const remaining = Math.max(0, limit - window.count);
    const resetSeconds = Math.max(1, Math.ceil((window.resetAt - now) / 1000));
    c.header("RateLimit-Limit", String(limit));
    c.header("RateLimit-Remaining", String(remaining));
    c.header("RateLimit-Reset", String(resetSeconds));

    if (window.count > limit) {
      c.header("Retry-After", String(resetSeconds));
      throw new HTTPException(429, { message: "Too Many Requests" });
    }

    await next();
  });
}
