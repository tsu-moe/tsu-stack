import { describe, expect, it } from "vite-plus/test";

import { parseWranglerIdentity } from "#@/cloudflare";

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
});
