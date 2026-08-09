import { readFile } from "node:fs/promises";

import { z } from "zod";

export async function getCliVersion(): Promise<string> {
  const packagePath = new URL("../package.json", import.meta.url);
  const packageJsonResult = z
    .object({ version: z.string().optional() })
    .safeParse(JSON.parse(await readFile(packagePath, "utf8")));
  return packageJsonResult.success ? (packageJsonResult.data.version ?? "0.0.0") : "0.0.0";
}
