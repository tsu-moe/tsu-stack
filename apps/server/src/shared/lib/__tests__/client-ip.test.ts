import { describe, expect, it } from "vite-plus/test";

import { resolveClientIp } from "#@/shared/lib/client-ip";

describe("resolveClientIp", () => {
  const trusted = new Set(["10.0.0.2", "10.0.0.3"]);
  const isTrustedProxy = (address: string) => trusted.has(address);

  it("ignores a forged forwarded chain from a direct client", () => {
    expect(resolveClientIp("198.51.100.10", "203.0.113.5", isTrustedProxy)).toBe("203.0.113.5");
  });

  it("uses the first untrusted address behind a trusted proxy chain", () => {
    expect(resolveClientIp("198.51.100.10, 10.0.0.3", "10.0.0.2", isTrustedProxy)).toBe("198.51.100.10");
  });

  it("ignores forged addresses prepended before the actual client", () => {
    expect(resolveClientIp("192.0.2.9, 198.51.100.10", "10.0.0.2", isTrustedProxy)).toBe("198.51.100.10");
  });

  it("normalizes IPv4-mapped connection addresses", () => {
    expect(resolveClientIp(undefined, "::ffff:203.0.113.5", isTrustedProxy)).toBe("203.0.113.5");
  });

  it("shares a fallback bucket when no connection address is available", () => {
    expect(resolveClientIp("198.51.100.10", undefined, isTrustedProxy)).toBe("unknown");
  });
});
