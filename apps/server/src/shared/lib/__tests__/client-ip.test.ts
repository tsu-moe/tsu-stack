import { describe, expect, it } from "vite-plus/test";

import { resolveClientIp, withClientIpHeaders } from "#@/shared/lib/client-ip";

describe("resolveClientIp", () => {
  it("uses one validated address from the configured trusted header", () => {
    expect(resolveClientIp("198.51.100.10")).toBe("198.51.100.10");
  });

  it("normalizes IPv4-mapped IPv6 addresses", () => {
    expect(resolveClientIp("::ffff:203.0.113.5")).toBe("203.0.113.5");
  });

  it("rejects forwarded chains because the trusted edge must overwrite the header", () => {
    expect(resolveClientIp("192.0.2.9, 198.51.100.10")).toBe("unknown");
  });

  it("shares a fallback bucket when the trusted header is unavailable", () => {
    expect(resolveClientIp(undefined)).toBe("unknown");
  });

  it("overwrites a spoofed private header before calling Better Auth", () => {
    const headers = withClientIpHeaders({ "x-tsu-client-ip": "198.51.100.10" }, "203.0.113.5");

    expect(headers.get("x-tsu-client-ip")).toBe("203.0.113.5");
  });
});
