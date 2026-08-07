import { describe, expect, it, vi } from "vite-plus/test";

const cancel = vi.fn();
const cancelled = Symbol("cancelled");

vi.mock("@clack/prompts", () => {
  return {
    cancel,
    intro: vi.fn(),
    isCancel: (value: unknown) => value === cancelled,
    text: vi.fn(async () => cancelled)
  };
});

const { collectProjectInput } = await import("#@/prompts");

describe("interactive cancellation", () => {
  it("exits the prompt flow without continuing generation", async () => {
    await expect(collectProjectInput({})).rejects.toThrow("CANCELLED");
    expect(cancel).toHaveBeenCalledWith("Project creation cancelled.");
  });
});
