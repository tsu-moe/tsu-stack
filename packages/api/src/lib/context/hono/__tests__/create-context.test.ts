import { Hono } from "hono";
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

  let contextResult: Awaited<ReturnType<typeof createContext>> | undefined;
  const app = new Hono();
  app.get("/", async (context) => {
    contextResult = await createContext({ context, logger });
    return context.body(null, 204);
  });

  const response = await app.request("/", {
    headers: { cookie: "better_auth.session_token=test" }
  });

  expect(response.status).toBe(204);
  expect(getSession).toHaveBeenCalledOnce();
  expect(contextResult?.session).toBe(session);
});
