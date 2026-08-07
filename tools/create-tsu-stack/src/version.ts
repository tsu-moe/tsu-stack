import { readFile } from "node:fs/promises";

type PackageJson = {
  version?: unknown;
};

export async function getCliVersion(): Promise<string> {
  const packagePath = new URL("../package.json", import.meta.url);
  const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as PackageJson;
  return typeof packageJson.version === "string" ? packageJson.version : "0.0.0";
}
