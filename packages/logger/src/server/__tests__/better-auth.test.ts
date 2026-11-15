import { expect, it, vi } from "vite-plus/test";

import { identifyRequestUser } from "#@/server/better-auth";
import { type RequestLogger } from "#@/server/index";

it("adds only the authenticated user ID to the request event", () => {
  const set = vi.fn();
  const logger = { set } as unknown as RequestLogger;

  const identified = identifyRequestUser(logger, {
    session: {
      id: "session-1",
      token: "secret-token"
    },
    user: {
      email: "user@example.com",
      id: "user-1",
      name: "Example User"
    }
  });

  expect(identified).toBe(true);
  expect(set).toHaveBeenCalledWith({
    user: { id: "user-1" },
    userId: "user-1"
  });
});
