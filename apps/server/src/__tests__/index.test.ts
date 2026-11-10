import { HTTPException } from "hono/http-exception";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

vi.mock("@tsu-stack/db", () => {
  return {
    checkIsDbReady: vi.fn().mockResolvedValue(false),
    createDb: vi.fn(() => {
      return {};
    })
  };
});

async function loadApp(options: { enableDocs: boolean; serverUrl?: string }) {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("IS_BUILD", "true");
  vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-at-least-32-characters-long");
  vi.stubEnv("VITE_SERVER_URL", options.serverUrl ?? "http://localhost:3000/server");
  vi.stubEnv("VITE_WEB_URL", "http://localhost:3000");
  vi.stubEnv("ENABLE_OPEN_API_DOCS", String(options.enableDocs));
  return import("#@/index");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("OpenAPI documentation", () => {
  it.each([
    "/server/docs",
    "/server/docs/spec.json",
    "/server/auth/open-api/generate-schema",
    "/server/auth/reference"
  ])("does not serve %s when ENABLE_OPEN_API_DOCS is false", async (path) => {
    const { app } = await loadApp({ enableDocs: false });

    expect((await app.request(path)).status).toBe(404);
  });

  it("keeps serving API routes when documentation is disabled", async () => {
    const { app } = await loadApp({ enableDocs: false });

    expect((await app.request("/server/health/live")).status).toBe(200);
  });

  it.each(["/server/docs", "/server/docs/spec.json", "/server/auth/open-api/generate-schema"])(
    "serves %s when ENABLE_OPEN_API_DOCS is true",
    async (path) => {
      const { app } = await loadApp({ enableDocs: true });

      expect((await app.request(path)).status).toBe(200);
    }
  );

  it("redirects Better Auth's reference route when documentation is enabled", async () => {
    const { app } = await loadApp({ enableDocs: true });

    const response = await app.request("/server/auth/reference");

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("http://localhost:3000/server/docs#auth-api-reference");
  });
});

describe("OpenAPI spec", () => {
  it.each(["http://localhost:3000/server", "https://api.example.com/server"])(
    "documents the session cookie Better Auth sets for %s",
    async (serverUrl) => {
      const { app } = await loadApp({ enableDocs: true, serverUrl });
      const { createAuth } = await import("@tsu-stack/auth/index");
      const { authCookies } = await createAuth().$context;

      const response = await app.request("/server/docs/spec.json");
      const spec = await response.json();

      expect(spec.components.securitySchemes.authCookie.name).toBe(authCookies.sessionToken.name);
    }
  );
});

describe("error responses", () => {
  it("masks unexpected error messages", async () => {
    const { app } = await loadApp({ enableDocs: false });
    app.get("/boom", () => {
      throw new Error('Failed query: select * from "user" where "email" = $1\nparams: victim@example.com');
    });

    const response = await app.request("/server/boom");

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ message: "Internal Server Error" });
  });

  it("preserves guidance from structured errors", async () => {
    const { app } = await loadApp({ enableDocs: false });
    const { createError } = await import("@tsu-stack/logger/server");
    app.get("/payment", () => {
      throw createError({
        fix: "Try another card",
        message: "Payment failed",
        status: 402,
        why: "Card declined"
      });
    });

    const response = await app.request("/server/payment");

    expect(response.status).toBe(402);
    expect(await response.json()).toEqual({
      fix: "Try another card",
      message: "Payment failed",
      why: "Card declined"
    });
  });

  it("preserves HTTP exception statuses and messages", async () => {
    const { app } = await loadApp({ enableDocs: false });
    app.get("/teapot", () => {
      throw new HTTPException(418, { message: "Short and stout" });
    });

    const response = await app.request("/server/teapot");

    expect(response.status).toBe(418);
    expect(await response.json()).toEqual({ message: "Short and stout" });
  });

  it("returns 503 when the readiness database check fails", async () => {
    const { app } = await loadApp({ enableDocs: false });

    const response = await app.request("/server/health/ready");

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      data: { checks: { database: { status: "unhealthy" } } }
    });
  });
});

describe("operational rate limits", () => {
  it("keeps liveness available during health-check bursts", async () => {
    const { app } = await loadApp({ enableDocs: false });

    for (let attempt = 0; attempt < 61; attempt++) {
      expect((await app.request("/server/health/live")).status).toBe(200);
    }
  });

  it("limits browser log ingestion per client", async () => {
    const { app } = await loadApp({ enableDocs: false });
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
    const { app } = await loadApp({ enableDocs: false });

    for (let attempt = 0; attempt < 30; attempt++) {
      expect((await app.request("/server/health/ready")).status).toBe(503);
    }

    const limited = await app.request("/server/health/ready");
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
  });
});
