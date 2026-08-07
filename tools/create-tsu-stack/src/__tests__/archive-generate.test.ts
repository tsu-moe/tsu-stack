import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import { archiveRootFromEntry, validateArchiveEntry } from "#@/archive";
import { assertDestinationAvailable } from "#@/generate";

describe("archive safety", () => {
  it.each([
    ["tsu-stack/file.txt", undefined, true],
    ["tsu-stack/packages/app/package.json", "File", true],
    ["tsu-stack/../../escape", "File", false],
    ["../escape", "File", false],
    ["C:/absolute/path", "File", false],
    ["/absolute/path", "File", false],
    ["tsu-stack/link", "SymbolicLink", false],
    ["tsu-stack/hard-link", "Link", false]
  ])("validates %s", (path, type, expected) => {
    expect(validateArchiveEntry(path, type)).toBe(expected);
  });

  it("identifies the single archive root used during extraction", () => {
    expect(archiveRootFromEntry("tsu-stack-abc123/packages/core/package.json")).toBe(
      "tsu-stack-abc123"
    );
    expect(archiveRootFromEntry("../escape")).toBeUndefined();
  });
});

describe("destination conflicts", () => {
  it("allows a missing or empty directory and rejects files in it", async () => {
    const root = await mkdtemp(join(tmpdir(), "create-tsu-stack-test-"));
    const missing = join(root, "missing");
    const empty = join(root, "empty");
    await mkdir(empty);

    await expect(assertDestinationAvailable(missing)).resolves.toBeUndefined();
    await expect(assertDestinationAvailable(empty)).resolves.toBeUndefined();

    await writeFile(join(empty, "keep.txt"), "user data");
    await expect(assertDestinationAvailable(empty)).rejects.toThrow("is not empty");
  });
});
