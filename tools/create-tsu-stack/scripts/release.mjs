import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { execa } from "execa";

const root = resolve(import.meta.dirname, "../../..");
const packageRoot = resolve(root, "tools/create-tsu-stack");
const packagePath = resolve(packageRoot, "package.json");
const packageRelativePath = "tools/create-tsu-stack/package.json";
const remote = "origin";
const releaseBranch = "main";

const arguments_ = process.argv.slice(2).filter((argument) => argument !== "--");
if (arguments_.includes("--help") || arguments_.includes("-h")) {
  console.log(`Usage: vp run release [version]

Examples:
  vp run release 1.0.0
  vp run release 1.0.0-beta.1
  vp run release prerelease

Without a version, bumpp prompts for one. A valid pending release is resumed automatically.`);
  process.exit(0);
}
if (arguments_.length > 1) throw new Error("Release accepts at most one version or release type.");

const requestedVersion = arguments_[0];

async function git(args, options = {}) {
  return execa("git", args, { cwd: root, ...options });
}

async function gitOutput(args) {
  return (await git(args)).stdout.trim();
}

async function readPackage() {
  return JSON.parse(await readFile(packagePath, "utf8"));
}

async function refCommit(ref) {
  const result = await git(["rev-parse", "--verify", `${ref}^{commit}`], { reject: false });
  return result.exitCode === 0 ? result.stdout.trim() : undefined;
}

async function remoteRefs(...refs) {
  const result = await git(["ls-remote", remote, ...refs], { reject: false });
  if (result.exitCode !== 0) {
    throw new Error(`Could not inspect ${remote}: ${result.stderr || result.stdout}`);
  }

  return new Map(
    result.stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => line.split(/\s+/, 2).reverse())
  );
}

async function remoteTagCommit(tag) {
  const ref = `refs/tags/${tag}`;
  const refs = await remoteRefs(ref, `${ref}^{}`);
  return refs.get(`${ref}^{}`) ?? refs.get(ref);
}

async function changedPaths(ref) {
  const output = await gitOutput(["diff-tree", "--no-commit-id", "--name-only", "-r", ref]);
  return output ? output.split(/\r?\n/) : [];
}

async function worktreePaths() {
  const output = await gitOutput(["status", "--porcelain=v1", "--untracked-files=all"]);
  return output ? output.split(/\r?\n/).map((line) => line.slice(3)) : [];
}

async function runValidation() {
  await execa("vp", ["check"], { cwd: packageRoot, stdio: "inherit" });
  await execa("vp", ["test"], { cwd: packageRoot, stdio: "inherit" });
  await execa("vp", ["run", "pack:check"], { cwd: packageRoot, stdio: "inherit" });
}

async function npmEntryExists(specification, field) {
  const result = await execa("npm", ["view", specification, field, "--json"], {
    cwd: packageRoot,
    reject: false
  });
  if (result.exitCode === 0) return true;

  const output = `${result.stdout}\n${result.stderr}`;
  if (/\bE404\b|404 Not Found/u.test(output)) return false;
  throw new Error(`Could not verify ${specification} on npm:\n${output.trim()}`);
}

async function assertRegistryBootstrap(manifest) {
  if (await npmEntryExists(manifest.name, "name")) return;
  throw new Error(
    `${manifest.name} does not exist on npm yet. Perform the documented first owner-authenticated publish and configure the trusted publisher before creating a release tag.`
  );
}

async function detectLocalRelease(remoteHead) {
  const manifest = await readPackage();
  const tag = `v${manifest.version}`;
  const head = await gitOutput(["rev-parse", "HEAD"]);
  const subject = await gitOutput(["log", "-1", "--format=%s"]);
  const tagCommit = await refCommit(`refs/tags/${tag}`);

  if (subject !== `chore(release): ${tag}` || tagCommit !== head) return undefined;
  if ((await changedPaths(head)).join("\n") !== packageRelativePath) return undefined;

  const parent = await gitOutput(["rev-parse", "HEAD^"]);
  const publishedTagCommit = await remoteTagCommit(tag);

  if (remoteHead === head && publishedTagCommit === head) {
    return { state: "complete", head, manifest, tag };
  }
  if (remoteHead === parent && !publishedTagCommit) {
    return { state: "pending-both", head, manifest, tag };
  }
  if (remoteHead === head && !publishedTagCommit) {
    return { state: "pending-tag", head, manifest, tag };
  }

  throw new Error(
    `Local ${tag} resembles a release, but ${remote}/${releaseBranch} and the remote tag are inconsistent. Inspect the refs before continuing.`
  );
}

async function pushRelease(tag, branchAlreadyPushed = false) {
  const tagRefspec = `refs/tags/${tag}:refs/tags/${tag}`;
  const refspecs = branchAlreadyPushed
    ? [tagRefspec]
    : [`HEAD:refs/heads/${releaseBranch}`, tagRefspec];

  await git(["push", "--dry-run", "--atomic", remote, ...refspecs], { stdio: "inherit" });
  await git(["push", "--atomic", remote, ...refspecs], { stdio: "inherit" });
}

async function verifyRemoteRelease(head, tag) {
  const refs = await remoteRefs(
    `refs/heads/${releaseBranch}`,
    `refs/tags/${tag}`,
    `refs/tags/${tag}^{}`
  );
  const branchCommit = refs.get(`refs/heads/${releaseBranch}`);
  const tagCommit = refs.get(`refs/tags/${tag}^{}`) ?? refs.get(`refs/tags/${tag}`);
  return branchCommit === head && tagCommit === head;
}

async function pushReleaseWithRecovery(head, tag, branchAlreadyPushed = false) {
  try {
    await pushRelease(tag, branchAlreadyPushed);
  } catch (error) {
    if (await verifyRemoteRelease(head, tag)) {
      console.log(
        `${tag} reached the remote despite the local push error; treating the release as pushed.`
      );
      return;
    }

    throw new Error(
      `The atomic push failed. The validated local commit and ${tag} were preserved. Fix the remote issue and rerun the same release command; it will resume instead of creating another version.`,
      { cause: error }
    );
  }
}

async function restoreUncommittedBump() {
  await git(["restore", "--staged", "--worktree", "--", packageRelativePath], { reject: false });
}

async function rollbackUnpublishedCommit(startHead, tag) {
  const head = await gitOutput(["rev-parse", "HEAD"]);
  const localTagCommit = await refCommit(`refs/tags/${tag}`);
  if (localTagCommit === head) await git(["tag", "--delete", tag]);
  if (head === startHead) return restoreUncommittedBump();

  const parent = await gitOutput(["rev-parse", "HEAD^"]);
  if (parent !== startHead || (await changedPaths(head)).join("\n") !== packageRelativePath) {
    throw new Error(
      "Release rollback stopped because HEAD no longer matches the commit created by this run."
    );
  }

  await git(["reset", "--mixed", startHead]);
  await restoreUncommittedBump();
}

async function main() {
  const branch = await gitOutput(["branch", "--show-current"]);
  if (branch !== releaseBranch) {
    throw new Error(`CLI releases must start on ${releaseBranch}, not ${branch || "HEAD"}.`);
  }
  if ((await worktreePaths()).length > 0) throw new Error("CLI releases require a clean worktree.");

  await git(["remote", "get-url", remote]);
  await git(["fetch", "--prune", remote, releaseBranch, "--tags"], { stdio: "inherit" });

  const localHead = await gitOutput(["rev-parse", "HEAD"]);
  const remoteHead = await gitOutput(["rev-parse", `${remote}/${releaseBranch}`]);
  const existingRelease = await detectLocalRelease(remoteHead);

  if (existingRelease?.state === "complete") {
    console.log(
      `${existingRelease.tag} is already present on ${remote}/${releaseBranch}; nothing to push.`
    );
    return;
  }

  if (existingRelease) {
    await assertRegistryBootstrap(existingRelease.manifest);
    console.log(`Resuming ${existingRelease.tag} from its validated local release commit.`);
    await runValidation();
    await pushReleaseWithRecovery(
      existingRelease.head,
      existingRelease.tag,
      existingRelease.state === "pending-tag"
    );
    console.log(`Pushed ${existingRelease.tag}. The tag workflow will publish the package.`);
    return;
  }

  if (localHead !== remoteHead) {
    throw new Error(`Local ${releaseBranch} must exactly match ${remote}/${releaseBranch}.`);
  }

  await assertRegistryBootstrap(await readPackage());
  await runValidation();

  let tag;
  try {
    const bumppArguments = [
      "exec",
      "bumpp",
      "package.json",
      ...(requestedVersion ? ["--release", requestedVersion] : []),
      "--no-commit",
      "--no-tag",
      "--no-push",
      "--no-install"
    ];
    await execa("vp", bumppArguments, { cwd: packageRoot, stdio: "inherit" });

    const touchedPaths = await worktreePaths();
    if (touchedPaths.length !== 1 || touchedPaths[0] !== packageRelativePath) {
      throw new Error(
        `Version bump touched unexpected paths: ${touchedPaths.join(", ") || "none"}.`
      );
    }

    const manifest = await readPackage();
    tag = `v${manifest.version}`;
    if (await refCommit(`refs/tags/${tag}`)) throw new Error(`Local tag ${tag} already exists.`);
    if (await remoteTagCommit(tag)) throw new Error(`Remote tag ${tag} already exists.`);
    if (await npmEntryExists(`${manifest.name}@${manifest.version}`, "version")) {
      throw new Error(`${manifest.name}@${manifest.version} is already published on npm.`);
    }

    // Exercise authentication, branch/tag protections, and atomic-push support before creating a commit.
    await git(
      [
        "push",
        "--dry-run",
        "--atomic",
        remote,
        `HEAD:refs/heads/${releaseBranch}`,
        `HEAD:refs/tags/${tag}`
      ],
      { stdio: "inherit" }
    );

    await git(["add", "--", packageRelativePath]);
    await git(["commit", "--message", `chore(release): ${tag}`, "--", packageRelativePath], {
      stdio: "inherit"
    });
    await git(["tag", "--annotate", tag, "--message", tag]);
  } catch (error) {
    const currentHead = await gitOutput(["rev-parse", "HEAD"]);
    if (currentHead !== localHead) await rollbackUnpublishedCommit(localHead, tag);
    else await restoreUncommittedBump();
    throw error;
  }

  const releaseHead = await gitOutput(["rev-parse", "HEAD"]);
  await pushReleaseWithRecovery(releaseHead, tag);

  console.log(
    `Pushed ${tag} atomically with ${releaseBranch}. The tag workflow will publish the package.`
  );
}

await main();
