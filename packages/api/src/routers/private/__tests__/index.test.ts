import { call } from "@orpc/server";
import { expect, it, vi } from "vite-plus/test";

import { createRequestLogger } from "@tsu-stack/logger/server";

import { type OrpcContext } from "#@/lib/context/types";
import { privateRouter } from "#@/routers/private/index";

vi.mock("@tsu-stack/auth/index", () => {
  return { createAuth: vi.fn() };
});

const context: OrpcContext = {
  logger: createRequestLogger({ method: "GET", path: "/private/data" }),
  requestHeaders: new Headers(),
  session: null
};

it("rejects anonymous requests for private data", async () => {
  await expect(call(privateRouter.data, undefined, { context })).rejects.toMatchObject({
    code: "UNAUTHORIZED"
  });
});

it("only returns the allowed account fields for the current session", async () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const user = {
    id: "user-1",
    name: "Private Demo",
    email: "demo@example.com",
    emailVerified: false,
    image: null,
    createdAt: now,
    updatedAt: now,
    internalField: "future auth plugin field"
  };
  const session: NonNullable<OrpcContext["session"]> = {
    user,
    session: {
      id: "session-1",
      userId: user.id,
      token: "test-session-token",
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date("2026-01-02T00:00:00Z")
    }
  };

  await expect(call(privateRouter.data, undefined, { context: { ...context, session } })).resolves.toStrictEqual({
    message: expect.any(String),
    user: { id: user.id, name: user.name }
  });
});
