import { lstat, mkdtemp, mkdir, readdir, rename, rm, rmdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { copy } from "fs-extra";

import { downloadAndExtractTemplate } from "./archive";
import { transformTemplate } from "./transform";
import { type ProjectInput, type ResolvedTemplate } from "./types";

export async function assertDestinationAvailable(target: string): Promise<void> {
  const targetStat = await lstat(target).catch((error: unknown) => {
    if (errorCode(error) === "ENOENT") return undefined;
    throw error;
  });
  if (!targetStat) return;
  if (targetStat.isSymbolicLink()) {
    throw new DestinationConflict(
      `Destination is a symbolic link: ${target}. Choose an empty directory or a new path.`
    );
  }
  if (!targetStat.isDirectory()) {
    throw new DestinationConflict(`Destination is a file: ${target}. Choose an empty directory or a new path.`);
  }
  const entries = await readdir(target);
  if (entries.includes(".tsu-stack.jsonc")) {
    throw new DestinationConflict(
      `A tsu-stack project already exists at ${target}. Continue setup in that project or choose a different directory.`
    );
  }
  if (entries.length > 0) {
    throw new DestinationConflict(
      `Destination directory is not empty: ${target}. Choose an empty directory or a new path.`
    );
  }
}

export class DestinationConflict extends Error {}

function errorCode(error: unknown): string | undefined {
  return error && typeof error === "object" && "code" in error && typeof error.code === "string"
    ? error.code
    : undefined;
}

async function stagingParent(directory: string): Promise<string> {
  let current = directory;
  while (true) {
    try {
      const entry = await stat(current);
      if (!entry.isDirectory()) throw new DestinationConflict(`Parent path is not a directory: ${current}`);
      return current;
    } catch (error) {
      const parent = dirname(current);
      if (errorCode(error) !== "ENOENT" || parent === current) throw error;
      current = parent;
    }
  }
}

async function removeEmptyDestination(target: string): Promise<boolean> {
  try {
    // rmdir is intentionally non-recursive: if a user populates the destination after the initial
    // check, the operation fails without deleting their files.
    await rmdir(target);
    return true;
  } catch (error) {
    const code = errorCode(error);
    if (code === "ENOENT") return false;
    if (code === "ENOTEMPTY" || code === "EEXIST" || code === "ENOTDIR") {
      throw new Error(`Destination directory is no longer empty: ${target}`, { cause: error });
    }
    throw error;
  }
}

async function placeProject(stagedProject: string, target: string): Promise<void> {
  const removedEmptyDestination = await removeEmptyDestination(target);
  try {
    // Staging is created on the same volume, so publication can use a rename.
    await rename(stagedProject, target);
  } catch (error) {
    if (removedEmptyDestination) {
      await mkdir(target).catch(() => {
        // The destination may already have been recreated by another process.
      });
    }
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

  const parent = dirname(target);
  // Stage under an existing ancestor to avoid leaving new folders after a download failure.
  const temporaryRoot = await mkdtemp(join(await stagingParent(parent), ".create-tsu-stack-"));
  const archivePath = join(temporaryRoot, "template.tar.gz");
  const stagedProject = join(temporaryRoot, "project");
  const currentDirectory = resolve(cwd);
  const inCurrentDirectory =
    currentDirectory === target ||
    (process.platform === "win32" && currentDirectory.toLowerCase() === target.toLowerCase());
  let keepStaging = false;

  try {
    await mkdir(stagedProject);
    await downloadAndExtractTemplate(template.commit, archivePath, stagedProject);
    await transformTemplate(stagedProject, input, template, cliVersion);
    if (inCurrentDirectory) {
      await assertDestinationAvailable(target);
      try {
        await copy(stagedProject, target, { errorOnExist: true, overwrite: false });
      } catch (error) {
        keepStaging = true;
        throw new Error(
          `Copying into ${target} did not finish. Some files may have been copied. The staged project is available at ${stagedProject}.\n${error instanceof Error ? error.message : String(error)}`,
          { cause: error }
        );
      }
    } else {
      await mkdir(parent, { recursive: true });
      await placeProject(stagedProject, target);
    }
  } catch (error) {
    if (keepStaging || error instanceof DestinationConflict) throw error;
    throw new Error(
      `Could not create the project at ${target}. The project was not published.\n${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
  } finally {
    if (!keepStaging) {
      await rm(temporaryRoot, { force: true, recursive: true }).catch(() => {
        process.stderr.write(`Could not clean up the temporary directory ${temporaryRoot}.\n`);
      });
    }
  }
  return target;
}
