import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { type CommandRunner, type ProjectInput } from "./types";

const D1_ID_PATTERN =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/iu;

export function d1DatabaseName(projectName: string): string {
  return `${projectName.slice(0, 61).replace(/-+$/u, "")}-db`;
}

export function parseD1DatabaseId(output: string): string {
  const databaseId = output.match(D1_ID_PATTERN)?.[0];
  if (!databaseId) {
    throw new Error("Cloudflare created the D1 database, but its database ID could not be read.");
  }
  return databaseId;
}

async function updateD1Binding(
  projectRoot: string,
  databaseName: string,
  databaseId: string
): Promise<void> {
  const configPath = join(projectRoot, "apps", "web", "wrangler.jsonc");
  const config = await readFile(configPath, "utf8");
  const next = config
    .replace(/("database_name"\s*:\s*)"[^"]*"/u, `$1${JSON.stringify(databaseName)}`)
    .replace(/("database_id"\s*:\s*)"[^"]*"/u, `$1${JSON.stringify(databaseId)}`);
  if (next === config || !next.includes(databaseId)) {
    throw new Error("Could not update the DB binding in apps/web/wrangler.jsonc.");
  }
  await writeFile(configPath, next, "utf8");
}

export async function provisionD1(
  projectRoot: string,
  input: ProjectInput,
  runner: CommandRunner
): Promise<void> {
  if (!(await runner.succeeds("vp", ["exec", "wrangler", "whoami"], projectRoot))) {
    await runner.run("vp", ["exec", "wrangler", "login"], projectRoot);
    if (!(await runner.succeeds("vp", ["exec", "wrangler", "whoami"], projectRoot))) {
      throw new Error(
        "Wrangler authentication did not complete. Run `vp exec wrangler login` and retry."
      );
    }
  }

  const databaseName = d1DatabaseName(input.projectName);
  let output: string;
  try {
    output = await runner.capture(
      "vp",
      ["exec", "wrangler", "d1", "create", databaseName, "--binding", "DB"],
      projectRoot
    );
  } catch (error) {
    throw new Error(
      `D1 creation failed. No binding was changed; retry with \`vp exec wrangler d1 create ${databaseName} --binding DB\`.`,
      { cause: error }
    );
  }

  const databaseId = parseD1DatabaseId(output);
  try {
    await updateD1Binding(projectRoot, databaseName, databaseId);
    await runner.run("vp", ["run", "db:migrate:remote"], projectRoot);
  } catch (error) {
    throw new Error(
      `D1 ${databaseName} (${databaseId}) was created, but setup did not finish. The generated project was preserved; check apps/web/wrangler.jsonc and run \`vp run db:migrate:remote\`.`,
      { cause: error }
    );
  }
}
