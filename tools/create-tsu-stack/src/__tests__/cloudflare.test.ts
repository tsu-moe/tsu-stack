import { describe, expect, it } from "vite-plus/test";

import { applyRemoteD1Migrations, parseWranglerIdentity } from "#@/cloudflare";
import { type CommandRunner } from "#@/types";

describe("Wrangler identity", () => {
  it("parses the authenticated user and available accounts", () => {
    expect(
      parseWranglerIdentity(
        JSON.stringify({
          accounts: [
            { id: "account-1", name: "Personal" },
            { id: "account-2", name: "Team" }
          ],
          email: "owner@example.com",
          loggedIn: true
        })
      )
    ).toEqual({
      accounts: [
        { id: "account-1", name: "Personal" },
        { id: "account-2", name: "Team" }
      ],
      email: "owner@example.com"
    });
  });

  it("rejects unauthenticated Wrangler output", () => {
    expect(() => parseWranglerIdentity(JSON.stringify({ accounts: [], loggedIn: false }))).toThrow(
      "Wrangler is not authenticated"
    );
  });

  it("retries remote migrations through app-local Wrangler", async () => {
    const calls: Array<{ args: string[]; cwd: string }> = [];
    let attempts = 0;
    const runner: CommandRunner = {
      async capture() {
        return "";
      },
      async run(_command, args, cwd) {
        attempts += 1;
        calls.push({ args, cwd });
        if (attempts < 3) throw new Error(`Cloudflare is not ready (${attempts})`);
      },
      async succeeds() {
        return true;
      }
    };

    await applyRemoteD1Migrations("project/apps/web", runner, async () => {});

    expect(calls).toHaveLength(3);
    expect(calls[0]).toEqual({
      args: ["exec", "wrangler", "d1", "migrations", "apply", "DB", "--remote"],
      cwd: "project/apps/web"
    });
  });
});
