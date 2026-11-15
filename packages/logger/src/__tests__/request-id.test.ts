import { describe, expect, it, vi } from "vite-plus/test";

import { resolveRequestId } from "#@/request-id";

describe("resolveRequestId", () => {
  it("preserves a valid incoming request ID", () => {
    const generator = vi.fn(() => "generated-id");

    expect(resolveRequestId(new Headers({ "x-request-id": "request-123_ABC=" }), { generator })).toBe(
      "request-123_ABC="
    );
    expect(generator).not.toHaveBeenCalled();
  });

  it.each(["", "contains spaces", "x".repeat(256)])("generates an ID for an invalid value", (requestId) => {
    expect(
      resolveRequestId(new Headers(requestId ? { "x-request-id": requestId } : undefined), {
        generator: () => "generated-id"
      })
    ).toBe("generated-id");
  });
});
