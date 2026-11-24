import { mkdtemp, mkdir, readdir, rename, rm, rmdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { copy, pathExists } from "fs-extra";

import { downloadAndExtractTemplate } from "./archive";
import { transformTemplate } from "./transform";
import { type ProjectInput, type ResolvedTemplate } from "./types";

export async function assertDestinationAvailable(target: string): Promise<void> {
  if (!(await pathExists(target))) return;
  const targetStat = await stat(target);
  if (!targetStat.isDirectory()) {
    throw new Error(`Destination already exists and is not a directory: ${target}`);
  }
  if ((await readdir(target)).length > 0) {
    throw new Error(`Destination directory is not empty: ${target}`);
  }
}

function errorCode(error: unknown): string | undefined {
  return error && typeof error === "object" && "code" in error && typeof error.code === "string"
    ? error.code
    : undefined;
}

async function removeEmptyDestination(target: string): Promise<void> {
  try {
    // rmdir is intentionally non-recursive: if a user populates the destination after the initial
    // check, the operation fails without deleting their files.
    await rmdir(target);
  } catch (error) {
    const code = errorCode(error);
    if (code === "ENOENT") return;
    if (code === "ENOTEMPTY" || code === "EEXIST" || code === "ENOTDIR") {
      throw new Error(`Destination directory is no longer empty: ${target}`, { cause: error });
    }
    throw error;
  }
}

async function placeProject(stagedProject: string, target: string, cwd: string): Promise<void> {
  await mkdir(dirname(target), { recursive: true });
  if (resolve(target) === resolve(cwd)) {
    await assertDestinationAvailable(target);
    await copy(stagedProject, target, { errorOnExist: true, overwrite: false });
    return;
  }
  await removeEmptyDestination(target);
  try {
    // Staging is created beside the destination below, so this rename remains atomic across
    // supported filesystems and cannot silently copy over a destination on another volume.
    await rename(stagedProject, target);
  } catch (error) {
    const code = errorCode(error);
    if (code === "EEXIST" || code === "ENOTEMPTY" || code === "ENOTDIR" || code === "EISDIR") {
      throw new Error(`Destination became occupied while publishing: ${target}`, { cause: error });
    }
    throw error;
  }
}

export async function generateProject(options: {
  cliVersion: string;
  cwd: string;
  input: ProjectInput;
  template: ResolvedTemplate;
}): Promise<string> {
  const { cliVersion, cwd, input, template } = options;
  const target = resolve(cwd, input.projectDirectory);
  await assertDestinationAvailable(target);

  // Keep the staging directory on the destination's volume so publication can use rename even
  // when the user's project lives outside the operating system's default temporary directory.
  await mkdir(dirname(target), { recursive: true });
  const temporaryRoot = await mkdtemp(join(dirname(target), ".create-tsu-stack-"));
  const archivePath = join(temporaryRoot, "template.tar.gz");
  const stagedProject = join(temporaryRoot, "project");
  await mkdir(stagedProject, { recursive: true });

  try {
    await downloadAndExtractTemplate(template.commit, archivePath, stagedProject);
    await transformTemplate(stagedProject, input, template, cliVersion);
    await placeProject(stagedProject, target, cwd);
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
  return target;
}
