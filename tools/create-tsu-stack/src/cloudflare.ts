import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import * as p from "@clack/prompts";

import { type CommandRunner, type ProjectInput } from "./types";

const D1_ID_PATTERN =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/iu;
const REMOTE_MIGRATION_ATTEMPTS = 3;

export type CloudflareAccount = {
  id: string;
  name: string;
};

export type WranglerIdentity = {
  accounts: CloudflareAccount[];
  email?: string;
};

export type CloudflareAccountDecision =
  | { accountId: string; action: "use" }
  | { action: "login" }
  | { action: "cancel" };

export type CloudflareAccountPrompt = (
  identity: WranglerIdentity
) => Promise<CloudflareAccountDecision>;

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

export function parseWranglerIdentity(output: string): WranglerIdentity {
  const value = JSON.parse(output) as unknown;
  if (!value || typeof value !== "object") {
    throw new Error("Wrangler returned an invalid account response.");
  }
  const record = value as Record<string, unknown>;
  if (record.loggedIn !== true || !Array.isArray(record.accounts)) {
    throw new Error("Wrangler is not authenticated with a Cloudflare account.");
  }
  const accounts = record.accounts.flatMap((account) => {
    if (!account || typeof account !== "object") return [];
    const candidate = account as Record<string, unknown>;
    if (typeof candidate.id !== "string" || typeof candidate.name !== "string") return [];
    return [{ id: candidate.id, name: candidate.name }];
  });
  if (accounts.length === 0) {
    throw new Error("The Wrangler login has no available Cloudflare accounts.");
  }
  return {
    accounts,
    ...(typeof record.email === "string" ? { email: record.email } : {})
  };
}

function unwrapDecision(decision: CloudflareAccountDecision | symbol): CloudflareAccountDecision {
  if (p.isCancel(decision)) {
    p.cancel("Remote D1 setup cancelled. The generated project was preserved.");
    throw new Error("CANCELLED");
  }
  return decision;
}

export const promptForCloudflareAccount: CloudflareAccountPrompt = async (identity) => {
  const accountSummary = identity.accounts
    .map((account) => `${account.name} (${account.id})`)
    .join("\n");
  p.note(
    [identity.email ? `Wrangler user: ${identity.email}` : undefined, accountSummary]
      .filter(Boolean)
      .join("\n"),
    "Cloudflare account"
  );

  return unwrapDecision(
    await p.select<CloudflareAccountDecision>({
      message: "Which Cloudflare account should own the remote D1 database?",
      options: [
        ...identity.accounts.map((account) => {
          return {
            hint: account.id,
            label: `Use ${account.name}`,
            value: { accountId: account.id, action: "use" } as const
          };
        }),
        {
          hint: "runs wrangler logout, then wrangler login",
          label: "Sign in with a different Wrangler account",
          value: { action: "login" } as const
        },
        {
          label: "Cancel remote setup",
          value: { action: "cancel" } as const
        }
      ]
    })
  );
};

async function chooseCloudflareAccount(
  webRoot: string,
  runner: CommandRunner,
  prompt: CloudflareAccountPrompt
): Promise<CloudflareAccount> {
  while (true) {
    let identity: WranglerIdentity;
    try {
      identity = parseWranglerIdentity(
        await runner.capture("vp", ["exec", "wrangler", "whoami", "--json"], webRoot)
      );
    } catch {
      p.log.info("Wrangler is not authenticated. Opening Cloudflare login...");
      await runner.run("vp", ["exec", "wrangler", "login"], webRoot);
      identity = parseWranglerIdentity(
        await runner.capture("vp", ["exec", "wrangler", "whoami", "--json"], webRoot)
      );
    }

    const decision = await prompt(identity);
    if (decision.action === "cancel") {
      p.cancel("Remote D1 setup cancelled. The generated project was preserved.");
      throw new Error("CANCELLED");
    }
    if (decision.action === "login") {
      await runner.run("vp", ["exec", "wrangler", "logout"], webRoot);
      await runner.run("vp", ["exec", "wrangler", "login"], webRoot);
      continue;
    }
    const account = identity.accounts.find(({ id }) => id === decision.accountId);
    if (!account) throw new Error("The selected Cloudflare account is no longer available.");
    return account;
  }
}

async function updateWranglerAccount(projectRoot: string, accountId: string): Promise<void> {
  const configPath = join(projectRoot, "apps", "web", "wrangler.jsonc");
  const config = await readFile(configPath, "utf8");
  const serializedId = JSON.stringify(accountId);
  const next = /"account_id"\s*:/u.test(config)
    ? config.replace(/("account_id"\s*:\s*)"[^"]*"/u, `$1${serializedId}`)
    : config.replace(/("name"\s*:\s*"[^"]*",\s*\r?\n)/u, `$1  "account_id": ${serializedId},\n`);
  if (next === config || !next.includes(`"account_id": ${serializedId}`)) {
    throw new Error("Could not scope apps/web/wrangler.jsonc to the selected account.");
  }
  await writeFile(configPath, next, "utf8");
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

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function wait(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function applyRemoteD1Migrations(
  webRoot: string,
  runner: CommandRunner,
  waitForRetry: (milliseconds: number) => Promise<void> = wait
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= REMOTE_MIGRATION_ATTEMPTS; attempt += 1) {
    try {
      await runner.run(
        "vp",
        ["exec", "wrangler", "d1", "migrations", "apply", "DB", "--remote"],
        webRoot
      );
      return;
    } catch (error) {
      lastError = error;
      if (attempt < REMOTE_MIGRATION_ATTEMPTS) {
        p.log.warn(
          `Remote D1 migration attempt ${attempt} failed; retrying after Cloudflare finishes provisioning the database.`
        );
        await waitForRetry(attempt * 1000);
      }
    }
  }
  throw lastError;
}

export async function provisionD1(
  projectRoot: string,
  input: ProjectInput,
  runner: CommandRunner,
  accountPrompt: CloudflareAccountPrompt = promptForCloudflareAccount
): Promise<void> {
  const webRoot = join(projectRoot, "apps", "web");
  const account = await chooseCloudflareAccount(webRoot, runner, accountPrompt);
  await updateWranglerAccount(projectRoot, account.id);
  p.log.info(`Remote D1 owner: ${account.name} (${account.id})`);

  const databaseName = d1DatabaseName(input.projectName);
  let output: string;
  try {
    output = await runner.capture(
      "vp",
      ["exec", "wrangler", "d1", "create", databaseName, "--binding", "DB"],
      webRoot
    );
  } catch (error) {
    throw new Error(
      `D1 creation failed in ${account.name} (${account.id}). The Wrangler config remains scoped to that account; from apps/web, retry with \`vp exec wrangler d1 create ${databaseName} --binding DB\`.`,
      { cause: error }
    );
  }

  const databaseId = parseD1DatabaseId(output);
  try {
    await updateD1Binding(projectRoot, databaseName, databaseId);
    await applyRemoteD1Migrations(webRoot, runner);
  } catch (error) {
    throw new Error(
      `D1 ${databaseName} (${databaseId}) was created, but setup did not finish: ${errorMessage(error)}. The generated project was preserved; check apps/web/wrangler.jsonc, then from apps/web run \`vp exec wrangler d1 migrations apply DB --remote\`.`,
      { cause: error }
    );
  }
}
