import { call } from "@orpc/server";
import { describe, expect, it } from "vite-plus/test";

import { createRequestLogger } from "@tsu-stack/logger/server";

import { type OrpcContext } from "#@/lib/context/types";
import { privateRouter } from "#@/routers/private/index";

const authenticatedSession = {
  session: {
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    expiresAt: new Date("2026-01-08T00:00:00.000Z"),
    id: "session_test",
    token: "test-session-token",
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    userId: "user_test"
  },
  user: {
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    email: "agent@example.com",
    emailVerified: true,
    id: "user_test",
    name: "Test Agent",
    updatedAt: new Date("2026-01-01T00:00:00.000Z")
  }
} satisfies NonNullable<OrpcContext["session"]>;

function createContext(session: OrpcContext["session"]): OrpcContext {
  return {
    logger: createRequestLogger({
      method: "GET",
      path: "/private/data"
    }),
    session
  };
}

describe("privateRouter.data", () => {
  it("rejects anonymous requests with an unauthorized error", async () => {
    const result = call(privateRouter.data, undefined, {
      context: createContext(null)
    });

    await expect(result).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401
    });
  });

  it("returns private data for an authenticated session", async () => {
    const result = await call(privateRouter.data, undefined, {
      context: createContext(authenticatedSession)
    });

    expect(result).toEqual({
      message: "This is private",
      user: authenticatedSession.user
    });
  });
});
