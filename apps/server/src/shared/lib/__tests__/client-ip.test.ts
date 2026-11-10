import { describe, expect, it } from "vite-plus/test";

import { resolveClientIp, withClientIpHeaders } from "#@/shared/lib/client-ip";

describe("resolveClientIp", () => {
  it("uses a validated Cloudflare client address", () => {
    expect(resolveClientIp("198.51.100.10")).toBe("198.51.100.10");
  });

  it("accepts IPv6 addresses", () => {
    expect(resolveClientIp("2001:db8::1")).toBe("2001:db8::1");
  });

  it("rejects forwarding chains", () => {
    expect(resolveClientIp("192.0.2.9, 198.51.100.10")).toBe("unknown");
  });

  it("shares a fallback bucket when Cloudflare omits the address", () => {
    expect(resolveClientIp(undefined)).toBe("unknown");
  });

  it("overwrites a spoofed private header before calling Better Auth", () => {
    const headers = withClientIpHeaders({ "x-tsu-client-ip": "198.51.100.10" }, "203.0.113.5");

    expect(headers.get("x-tsu-client-ip")).toBe("203.0.113.5");
  });
});
