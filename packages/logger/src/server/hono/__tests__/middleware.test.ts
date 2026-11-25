import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { honoLogIngestionMiddleware } from "#@/server/hono/middleware";
import { initLogger, REQUEST_LOG_SAMPLING } from "#@/server/index";

const drain = vi.fn();
initLogger({ drain, sampling: REQUEST_LOG_SAMPLING, silent: true });

const app = new Hono();
app.post("/_logs/ingest", honoLogIngestionMiddleware());

function payload(
  event: {
    audit?: { action: string; actor: { type: string; id: string }; outcome: string };
    error?: { name: string; stack: string };
    level?: string;
    note?: string;
    status?: number;
    user?: { id: string };
  } = {}
) {
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
  beforeEach(() => drain.mockClear());

  it("keeps client severity separate and strips client audit fields and raw diagnostics", async () => {
    const response = await app.request("/_logs/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify([
        payload({
          audit: { action: "user.create", actor: { type: "user", id: "forged" }, outcome: "success" },
          error: { name: "TypeError", stack: "untrusted content" },
          level: "fatal",
          status: 200,
          user: { id: "forged" }
        })
      ])
    });

    expect(response.status).toBe(204);
    expect(drain).toHaveBeenCalledExactlyOnceWith({
      event: expect.objectContaining({
        level: "info",
        source: "client",
        client: {
          clientTimestamp: "2026-01-01T00:00:00.000Z",
          environment: "test",
          error: { name: "TypeError" },
          level: "fatal",
          service: "web",
          status: 200,
          user: { id: "forged" }
        }
      })
    });
    expect(drain.mock.calls[0]?.[0]?.event).not.toHaveProperty("audit");
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
    expect(drain).not.toHaveBeenCalled();
  });

  it("rejects unsupported media types", async () => {
    const plain = await app.request("/_logs/ingest", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: JSON.stringify([payload()])
    });

    expect(plain.status).toBe(415);
    expect(drain).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const response = await app.request("/_logs/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "["
    });

    expect(response.status).toBe(400);
    expect(drain).not.toHaveBeenCalled();
  });

  it("rejects invalid batches without accepting any events", async () => {
    const oversizedBatch = await app.request("/_logs/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Array.from({ length: 51 }, () => payload()))
    });
    const invalidEvent = await app.request("/_logs/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify([payload(), { event: { level: "info" } }])
    });

    expect(oversizedBatch.status).toBe(422);
    expect(invalidEvent.status).toBe(422);
    expect(drain).not.toHaveBeenCalled();
  });
});
