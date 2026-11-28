import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import type * as DbModule from "@tsu-stack/db";

vi.mock("@tsu-stack/db", async (importOriginal) => {
  const original = await importOriginal<typeof DbModule>();
  return { ...original, checkIsDbReady: vi.fn().mockResolvedValue(false) };
});

async function loadApp() {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("IS_BUILD", "true");
  vi.stubEnv("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:1/tsu-stack-test");
  vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-at-least-32-characters-long");
  vi.stubEnv("VITE_SERVER_URL", "http://localhost:3000/server");
  vi.stubEnv("VITE_WEB_URL", "http://localhost:3000");
  vi.stubEnv("ENABLE_OPEN_API_DOCS", "false");
  return import("#@/index");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

it("keeps every OpenAPI documentation endpoint private when docs are disabled", async () => {
  const { app } = await loadApp();
  const paths = [
    "/server/docs",
    "/server/docs/spec.json",
    "/server/auth/open-api/generate-schema",
    "/server/auth/reference"
  ];
  for (const path of paths) {
    expect((await app.request(path)).status).toBe(404);
  }
});

describe("error responses", () => {
  it("masks unexpected error messages", async () => {
    const { app } = await loadApp();
    app.get("/boom", () => {
      throw new Error('Failed query: select * from "user" where "email" = $1\nparams: victim@example.com');
    });

    const response = await app.request("/server/boom");

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ message: "Internal Server Error" });
  });

  it("returns 503 when the readiness database check fails", async () => {
    const { app } = await loadApp();

    const response = await app.request("/server/health/ready");

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      data: { checks: { database: { status: "unhealthy" } } }
    });
  });
});

describe("request correlation", () => {
  it("echoes a valid request ID and exposes it to the web origin", async () => {
    const { app } = await loadApp();

    const response = await app.request("/server/health/live", {
      headers: {
        origin: "http://localhost:3000",
        "x-request-id": "request-123"
      }
    });

    expect(response.headers.get("x-request-id")).toBe("request-123");
    expect(response.headers.get("access-control-expose-headers")).toContain("X-Request-Id");
  });

  it("passes the same validated request ID to Better Auth and the client", async () => {
    const { app } = await loadApp();
    const { auth } = await import("@tsu-stack/auth/index");
    const handler = vi.spyOn(auth, "handler").mockResolvedValue(new Response(null, { status: 204 }));

    try {
      const response = await app.request("/server/auth/get-session", {
        headers: { "X-Request-Id": "invalid request id" }
      });

      const requestId = response.headers.get("X-Request-Id");
      expect(response.status).toBe(204);
      expect(requestId).toBeTruthy();
      expect(requestId).not.toBe("invalid request id");
      expect(handler.mock.calls[0]?.[0].headers.get("X-Request-Id")).toBe(requestId);
    } finally {
      handler.mockRestore();
    }
  });
});

describe("operational rate limits", () => {
  it("keeps liveness available during health-check bursts", async () => {
    const { app } = await loadApp();

    for (let attempt = 0; attempt < 61; attempt++) {
      expect((await app.request("/server/health/live")).status).toBe(200);
    }
  });

  it("limits browser log ingestion per client", async () => {
    const { app } = await loadApp();
    const request = () =>
      app.request("/server/_logs/ingest", {
        body: "[]",
        headers: { "content-type": "application/json" },
        method: "POST"
      });

    for (let attempt = 0; attempt < 60; attempt++) {
      expect((await request()).status).toBe(204);
    }

    const limited = await request();
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
  });

  it("limits database readiness checks per client", async () => {
    const { app } = await loadApp();

    for (let attempt = 0; attempt < 30; attempt++) {
      expect((await app.request("/server/health/ready")).status).toBe(503);
    }

    const limited = await app.request("/server/health/ready");
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
  });
});

it("skips session resolution for liveness and passes the session to protected procedures", async () => {
  const { app } = await loadApp();
  const { auth } = await import("@tsu-stack/auth/index");
  const now = new Date();
  const getSession = vi.spyOn(auth.api, "getSession").mockResolvedValue({
    user: {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      emailVerified: true,
      createdAt: now,
      updatedAt: now
    },
    session: {
      id: "session-1",
      userId: "user-1",
      token: "test-session-token",
      createdAt: now,
      updatedAt: now,
      expiresAt: now
    }
  });

  try {
    const headers = { cookie: "test-session-cookie=present" };
    const liveResponse = await app.request("/server/health/live", { headers });
    expect(liveResponse.status).toBe(200);
    expect(await liveResponse.json()).toMatchObject({ status: "healthy" });
    const rpcLiveResponse = await app.request("/server/rpc/health/live/", { headers, method: "POST" });
    expect(rpcLiveResponse.status).toBe(200);
    expect(await rpcLiveResponse.json()).toMatchObject({ json: { status: "healthy" } });
    expect(getSession).not.toHaveBeenCalled();

    const response = await app.request("/server/private/data", { headers });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ user: { id: "user-1", name: "Test User" } });
    expect(getSession).toHaveBeenCalledTimes(1);
    expect(new Headers(getSession.mock.calls[0]?.[0]?.headers).get("cookie")).toBe(headers.cookie);
  } finally {
    getSession.mockRestore();
  }
});

it("allows the evlog browser transport to preflight log ingestion", async () => {
  const { app } = await loadApp();
  const response = await app.request("/server/_logs/ingest", {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:3000",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type,x-evlog-source"
    }
  });

  expect(response.status).toBe(204);
  expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
  expect(response.headers.get("access-control-allow-headers")?.toLowerCase().split(/,\s*/)).toEqual(
    expect.arrayContaining(["content-type", "x-evlog-source"])
  );
});
