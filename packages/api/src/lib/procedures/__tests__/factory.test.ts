import { call } from "@orpc/server";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { createRequestLogger } from "@tsu-stack/logger/server";

import { type OrpcContext } from "#@/lib/context/types";
import { freshProtectedProcedure } from "#@/lib/procedures/factory";

const getSession = vi.hoisted(() => vi.fn());

vi.mock("@tsu-stack/auth/index", () => {
  return { auth: { api: { getSession } } };
});

const headers = new Headers({ cookie: "better_auth.session_token=test" });
const cachedSession = { user: { id: "cached" } } as NonNullable<OrpcContext["session"]>;
const freshSession = { user: { id: "fresh" } } as NonNullable<OrpcContext["session"]>;
const procedure = freshProtectedProcedure.handler(({ context }) => context.session.user.id);

const context: OrpcContext = {
  logger: createRequestLogger({ method: "POST", path: "/private/action" }),
  requestHeaders: headers,
  session: cachedSession
};

describe("freshProtectedProcedure", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a session revoked after the cached lookup", async () => {
    getSession.mockResolvedValueOnce(null);

    await expect(call(procedure, undefined, { context })).rejects.toMatchObject({
      code: "UNAUTHORIZED"
    });
    expect(getSession).toHaveBeenCalledWith({
      headers,
      query: { disableCookieCache: true }
    });
  });

  it("passes the fresh session to the handler", async () => {
    getSession.mockResolvedValueOnce(freshSession);

    await expect(call(procedure, undefined, { context })).resolves.toBe("fresh");
  });
});
