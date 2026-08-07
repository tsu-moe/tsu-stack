import { resolve } from "node:path";

import { execa } from "execa";

const root = resolve(import.meta.dirname, "../../..");
const requestedVersion = process.argv[2];

async function git(args) {
  return execa("git", args, { cwd: root });
}

const branch = (await git(["branch", "--show-current"])).stdout.trim();
if (branch !== "main") throw new Error(`CLI releases must start on main, not ${branch || "HEAD"}.`);

const status = (await git(["status", "--porcelain"])).stdout.trim();
if (status) throw new Error("CLI releases require a clean worktree.");

await git(["fetch", "origin", "main", "--tags"]);
const localHead = (await git(["rev-parse", "HEAD"])).stdout.trim();
const remoteHead = (await git(["rev-parse", "origin/main"])).stdout.trim();
if (localHead !== remoteHead) throw new Error("Local main must exactly match origin/main.");

await execa("vp", ["check"], { cwd: resolve(root, "tools/create-tsu-stack"), stdio: "inherit" });
await execa("vp", ["test"], { cwd: resolve(root, "tools/create-tsu-stack"), stdio: "inherit" });
await execa("vp", ["run", "pack:check"], {
  cwd: resolve(root, "tools/create-tsu-stack"),
  stdio: "inherit"
});

const bumppArguments = [
  ...(requestedVersion ? ["--release", requestedVersion] : []),
  "--commit",
  "chore(release): v{version}",
  "--tag",
  "v{version}",
  "--push"
];
await execa("vp", ["exec", "bumpp", ...bumppArguments], {
  cwd: resolve(root, "tools/create-tsu-stack"),
  stdio: "inherit"
});
