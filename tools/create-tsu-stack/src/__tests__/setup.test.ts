import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import { assertSetupPrerequisites, createLocalEnvironment, runPostGeneration } from "#@/setup";
import { type CommandRunner, type ProjectInput } from "#@/types";

const input: ProjectInput = {
  displayName: "Test App",
  dryRun: false,
  git: true,
  install: true,
  projectDirectory: "test-app",
  projectName: "test-app",
  scope: "@test-app",
  setup: "local",
  variant: "separate"
};

async function projectFixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "create-tsu-stack-setup-"));
  const envDirectory = join(root, "packages", "env");
  await mkdir(envDirectory, { recursive: true });
  await writeFile(
    join(envDirectory, ".env.example"),
    'BETTER_AUTH_SECRET=""\nVITE_SERVER_URL="old"\nVITE_WEB_URL="old"\n'
  );
  return root;
}

describe("guided setup", () => {
  it("installs, configures the database, then initializes git", async () => {
    const calls: string[] = [];
    const runner: CommandRunner = {
      async capture() {
        return "";
      },
      async run(command, args) {
        calls.push([command, ...args].join(" "));
      },
      async succeeds() {
        return true;
      }
    };

    await runPostGeneration(await projectFixture(), input, runner);
    expect(calls).toEqual(["vp install", "vp run db:dev:start", "vp run db:migrate", "git init"]);
  });

  it("reports unavailable Docker before generation", async () => {
    const runner: CommandRunner = {
      async capture() {
        return "";
      },
      async run() {},
      async succeeds(command) {
        return command !== "docker";
      }
    };
    await expect(assertSetupPrerequisites(input, runner, ".")).rejects.toThrow(
      "Docker is required"
    );
  });

  it("leaves git uninitialized when a setup command fails", async () => {
    const calls: string[] = [];
    const runner: CommandRunner = {
      async capture() {
        return "";
      },
      async run(command, args) {
        const call = [command, ...args].join(" ");
        calls.push(call);
        if (call === "vp run db:migrate") throw new Error("migration failed");
      },
      async succeeds() {
        return true;
      }
    };
    await expect(runPostGeneration(await projectFixture(), input, runner)).rejects.toThrow(
      "migration failed"
    );
    expect(calls).not.toContain("git init");
  });

  it("creates an ignored local env with generated values", async () => {
    const root = await projectFixture();
    const envDirectory = join(root, "packages", "env");

    await createLocalEnvironment(root, input);
    const env = await readFile(join(envDirectory, ".env"), "utf8");
    expect(env).toContain('VITE_SERVER_URL="http://localhost:5000/server"');
    expect(env).toContain('VITE_WEB_URL="http://localhost:3000/web"');
    expect(env).toMatch(/BETTER_AUTH_SECRET="[A-Za-z0-9_-]{43}"/u);
  });

  it("sets up local D1 without requiring Docker", async () => {
    const calls: string[] = [];
    const d1Input: ProjectInput = { ...input, variant: "cloudflare-d1" };
    const runner: CommandRunner = {
      async capture() {
        return "";
      },
      async run(command, args) {
        calls.push([command, ...args].join(" "));
      },
      async succeeds(command) {
        return command !== "docker";
      }
    };

    await expect(assertSetupPrerequisites(d1Input, runner, ".")).resolves.toBeUndefined();
    await runPostGeneration(await projectFixture(), d1Input, runner);
    expect(calls).toEqual(["vp install", "vp run db:migrate:local", "git init"]);
  });

  it("provisions, binds, and migrates an explicitly requested remote D1 database", async () => {
    const root = await projectFixture();
    const wranglerPath = join(root, "apps", "web", "wrangler.jsonc");
    await mkdir(join(root, "apps", "web"), { recursive: true });
    await writeFile(
      wranglerPath,
      '{\n  "name": "moon-garden",\n  "d1_databases":[{"binding":"DB","database_name":"tsu-stack-db","database_id":"00000000-0000-0000-0000-000000000000"}]\n}'
    );
    const calls: string[] = [];
    const wranglerDirectories: string[] = [];
    const databaseId = "12345678-1234-4123-8123-123456789abc";
    const runner: CommandRunner = {
      async capture(command, args, cwd) {
        calls.push([command, ...args].join(" "));
        wranglerDirectories.push(cwd);
        if (args.includes("whoami")) {
          return JSON.stringify({
            accounts: [{ id: "account-123", name: "Moon Garden Team" }],
            email: "owner@example.com",
            loggedIn: true
          });
        }
        return `database_id = "${databaseId}"`;
      },
      async run(command, args, cwd) {
        calls.push([command, ...args].join(" "));
        if (args.includes("db:migrate:remote")) wranglerDirectories.push(cwd);
      },
      async succeeds(command, args) {
        calls.push([command, ...args].join(" "));
        return true;
      }
    };
    const remoteInput: ProjectInput = {
      ...input,
      projectName: "moon-garden",
      setup: "cloudflare",
      variant: "cloudflare-d1"
    };

    await runPostGeneration(root, remoteInput, runner, async () => {
      return {
        accountId: "account-123",
        action: "use"
      };
    });

    expect(calls).toEqual([
      "vp install",
      "vp exec wrangler whoami --json",
      "vp exec wrangler d1 create moon-garden-db --binding DB",
      "vp run db:migrate:remote",
      "git init"
    ]);
    expect(wranglerDirectories).toEqual([
      join(root, "apps", "web"),
      join(root, "apps", "web"),
      join(root, "apps", "web")
    ]);
    const config = await readFile(wranglerPath, "utf8");
    expect(config).toContain(`"database_name":"moon-garden-db"`);
    expect(config).toContain(`"database_id":"${databaseId}"`);
    expect(config).toContain('"account_id": "account-123"');
  });

  it("can switch Wrangler logins before selecting the D1 owner", async () => {
    const root = await projectFixture();
    await mkdir(join(root, "apps", "web"), { recursive: true });
    await writeFile(
      join(root, "apps", "web", "wrangler.jsonc"),
      '{\n  "name": "moon-garden",\n  "d1_databases":[{"binding":"DB","database_name":"tsu-stack-db","database_id":"00000000-0000-0000-0000-000000000000"}]\n}'
    );
    const calls: string[] = [];
    let identityCall = 0;
    const runner: CommandRunner = {
      async capture(command, args) {
        calls.push([command, ...args].join(" "));
        if (args.includes("whoami")) {
          identityCall += 1;
          return JSON.stringify({
            accounts: [
              {
                id: identityCall === 1 ? "wrong-account" : "correct-account",
                name: identityCall === 1 ? "Wrong Team" : "Correct Team"
              }
            ],
            loggedIn: true
          });
        }
        return 'database_id = "12345678-1234-4123-8123-123456789abc"';
      },
      async run(command, args) {
        calls.push([command, ...args].join(" "));
      },
      async succeeds() {
        return true;
      }
    };
    let promptCall = 0;

    await runPostGeneration(
      root,
      {
        ...input,
        git: false,
        install: false,
        projectName: "moon-garden",
        setup: "cloudflare",
        variant: "cloudflare-d1"
      },
      runner,
      async () => {
        promptCall += 1;
        return promptCall === 1
          ? { action: "login" }
          : { accountId: "correct-account", action: "use" };
      }
    );

    expect(calls.slice(0, 5)).toEqual([
      "vp exec wrangler whoami --json",
      "vp exec wrangler logout",
      "vp exec wrangler login",
      "vp exec wrangler whoami --json",
      "vp exec wrangler d1 create moon-garden-db --binding DB"
    ]);
    expect(await readFile(join(root, "apps", "web", "wrangler.jsonc"), "utf8")).toContain(
      '"account_id": "correct-account"'
    );
  });
});
