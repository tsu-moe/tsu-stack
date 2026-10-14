import { createServerEntry, getResponseHeaders, setCookie } from "@tanstack/react-start/server";
import { expect, it, vi } from "vite-plus/test";

import { _getUser } from "#@/react/tanstack-start/functions";

const { getSession } = vi.hoisted(() => {
  return { getSession: vi.fn() };
});

vi.mock("#@/index", () => {
  return {
    createAuth: () => {
      return { api: { getSession } };
    }
  };
});

it("preserves existing response cookies while forwarding every refreshed auth cookie", async () => {
  const headers = new Headers();
  headers.append("Set-Cookie", "session=refreshed; Path=/; HttpOnly");
  headers.append("Set-Cookie", "session-cache=refreshed; Path=/; HttpOnly");
  const user = { id: "user-1" };
  getSession.mockResolvedValue({ headers, response: { user } });

  const entry = createServerEntry({
    fetch: async () => {
      setCookie("locale", "de", { path: "/" });
      const result = await _getUser();
      const response = Response.json(result);
      for (const cookie of getResponseHeaders().getSetCookie()) {
        response.headers.append("Set-Cookie", cookie);
      }
      return response;
    }
  });

  const request = new Request("http://localhost/session", {
    headers: { Cookie: "session=original" }
  });
  const response = await entry.fetch(request);

  expect(await response.json()).toEqual(user);
  expect(response.headers.getSetCookie()).toEqual(
    expect.arrayContaining(["locale=de; Path=/", ...headers.getSetCookie()])
  );
  expect(response.headers.getSetCookie()).toHaveLength(3);
  expect(getSession).toHaveBeenCalledWith({
    headers: request.headers,
    query: undefined,
    returnHeaders: true
  });
});
