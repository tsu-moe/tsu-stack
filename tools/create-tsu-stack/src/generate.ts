import { mkdtemp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { copy, move, pathExists, remove } from "fs-extra";

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

async function placeProject(stagedProject: string, target: string, cwd: string): Promise<void> {
  await mkdir(dirname(target), { recursive: true });
  if (resolve(target) === resolve(cwd)) {
    await copy(stagedProject, target, { errorOnExist: true, overwrite: false });
    return;
  }
  if (await pathExists(target)) await remove(target);
  await move(stagedProject, target);
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

  const temporaryRoot = await mkdtemp(join(tmpdir(), "create-tsu-stack-"));
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
