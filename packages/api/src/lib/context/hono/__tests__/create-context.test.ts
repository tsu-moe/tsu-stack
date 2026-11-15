import { expect, it, vi } from "vite-plus/test";

import { type RequestLogger } from "@tsu-stack/logger/server";

import { createContext } from "#@/lib/context/hono/create-context";

const getSession = vi.hoisted(() => vi.fn());

vi.mock("@tsu-stack/auth/index", () => {
  return { auth: { api: { getSession } } };
});

it("adds the resolved session to the oRPC context", async () => {
  const logger = {} as RequestLogger;
  const session = {
    session: { id: "session-1" },
    user: { id: "user-1" }
  };
  getSession.mockResolvedValue(session);
  const requestHeaders = new Headers({ cookie: "better_auth.session_token=test" });

  const contextResult = await createContext({ logger, requestHeaders });

  expect(getSession).toHaveBeenCalledWith({ headers: requestHeaders });
  expect(contextResult.session).toBe(session);
});
