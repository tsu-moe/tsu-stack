import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { execa } from "execa";

const packageDirectory = resolve(import.meta.dirname, "..");
const temporaryDirectory = await mkdtemp(join(tmpdir(), "create-tsu-stack-pack-"));
let tarball;

try {
  const packed = await execa("npm", ["pack", "--json", "--pack-destination", temporaryDirectory], {
    cwd: packageDirectory
  });
  const result = JSON.parse(packed.stdout);
  if (!Array.isArray(result) || typeof result[0]?.filename !== "string") {
    throw new Error("npm pack did not return a tarball filename.");
  }
  tarball = join(temporaryDirectory, result[0].filename);
  await readFile(tarball);

  const execution = await execa(
    "npm",
    ["exec", "--yes", "--package", tarball, "--", "create-tsu-stack", "--help"],
    { cwd: temporaryDirectory }
  );
  if (!execution.stdout.includes("create-tsu-stack [project-directory]")) {
    throw new Error("Packed CLI help output was not recognized.");
  }
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
