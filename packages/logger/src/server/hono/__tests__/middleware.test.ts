import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { honoLogIngestionMiddleware } from "#@/server/hono/middleware";

const infoLog = vi.hoisted(() => vi.fn());

vi.mock("evlog", () => {
  return {
    log: {
      debug: vi.fn(),
      error: vi.fn(),
      info: infoLog,
      warn: vi.fn()
    }
  };
});

const app = new Hono();
app.post("/_logs/ingest", honoLogIngestionMiddleware());

function payload(event: { note?: string; status?: number; user?: { id: string } } = {}) {
  return {
    event: {
      environment: "test",
      level: "info",
      service: "web",
      timestamp: "2026-01-01T00:00:00.000Z",
      ...event
    }
  };
}

describe("honoLogIngestionMiddleware", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts JSON logs but nests untrusted fields", async () => {
    const response = await app.request("/_logs/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify([payload({ status: 200, user: { id: "forged" } })])
    });

    expect(response.status).toBe(204);
    expect(infoLog).toHaveBeenCalledWith({
      client: expect.objectContaining({ status: 200, user: { id: "forged" } }),
      source: "client"
    });
  });

  it("rejects a chunked body larger than 64 KiB", async () => {
    const bytes = new TextEncoder().encode(JSON.stringify([payload({ note: "x".repeat(70_000) })]));
    const response = await app.request(
      new Request("http://localhost/_logs/ingest", {
        method: "POST",
        headers: { "content-type": "application/json", "transfer-encoding": "chunked" },
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(bytes.subarray(0, 40_000));
            controller.enqueue(bytes.subarray(40_000));
            controller.close();
          }
        }),
        duplex: "half"
      } as RequestInit & { duplex: string })
    );

    expect(response.status).toBe(413);
    expect(infoLog).not.toHaveBeenCalled();
  });

  it("rejects text/plain and ignores batches larger than 50", async () => {
    const plain = await app.request("/_logs/ingest", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: JSON.stringify([payload()])
    });
    const oversizedBatch = await app.request("/_logs/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Array.from({ length: 51 }, () => payload()))
    });

    expect(plain.status).toBe(415);
    expect(oversizedBatch.status).toBe(204);
    expect(infoLog).not.toHaveBeenCalled();
  });
});
