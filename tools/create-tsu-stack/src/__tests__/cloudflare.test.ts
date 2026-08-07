import { describe, expect, it } from "vite-plus/test";

import {
  applyRemoteD1Migrations,
  parseD1DatabaseList,
  parseWranglerIdentity,
  updateD1BindingContent,
  validateD1DatabaseName
} from "#@/cloudflare";
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

  it("parses Wrangler's remote D1 database list", () => {
    expect(
      parseD1DatabaseList(JSON.stringify([{ name: "moon-garden-db", uuid: "database-123" }]))
    ).toEqual([{ id: "database-123", name: "moon-garden-db" }]);
  });

  it("validates conservative Cloudflare D1 database names", () => {
    expect(validateD1DatabaseName("a")).toBeUndefined();
    expect(validateD1DatabaseName("moon-garden-db")).toBeUndefined();
    expect(validateD1DatabaseName(" ")).toContain("Enter");
    expect(validateD1DatabaseName("Moon Garden DB")).toContain("lowercase");
    expect(validateD1DatabaseName("-moon-garden")).toContain("start and end");
    expect(validateD1DatabaseName("a".repeat(65))).toContain("64");
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

  it("accepts a D1 binding that Wrangler already updated", () => {
    const config = `{
  "d1_databases": [{
    "binding": "DB",
    "database_name": "moon-garden-db",
    "database_id": "12345678-1234-4123-8123-123456789abc"
  }]
}`;

    expect(
      updateD1BindingContent(config, "moon-garden-db", "12345678-1234-4123-8123-123456789abc")
    ).toBe(config);
  });
});
