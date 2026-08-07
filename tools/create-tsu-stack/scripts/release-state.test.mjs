import assert from "node:assert/strict";
import test from "node:test";

import { parsePorcelainV1Z } from "./release-state.mjs";

test("preserves paths for unstaged changes with a leading status space", () => {
  assert.deepEqual(parsePorcelainV1Z(" M tools/create-tsu-stack/package.json\0"), [
    "tools/create-tsu-stack/package.json"
  ]);
});

test("parses staged and untracked paths", () => {
  assert.deepEqual(parsePorcelainV1Z("M  staged.json\0?? untracked.json\0"), [
    "staged.json",
    "untracked.json"
  ]);
});

test("includes both paths from rename entries", () => {
  assert.deepEqual(parsePorcelainV1Z("R  renamed.json\0original.json\0"), [
    "renamed.json",
    "original.json"
  ]);
});

test("parses a clean worktree", () => {
  assert.deepEqual(parsePorcelainV1Z(""), []);
});
