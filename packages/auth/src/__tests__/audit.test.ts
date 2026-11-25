import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { expect, it, vi } from "vite-plus/test";

import { initLogger, REQUEST_LOG_SAMPLING } from "@tsu-stack/logger/server";

import { authAuditHooks } from "#@/audit";

it("audits an actual account creation and ignores a synthetic duplicate signup", async () => {
  const drain = vi.fn();
  initLogger({ drain, sampling: REQUEST_LOG_SAMPLING, silent: true });

  const auth = betterAuth({
    baseURL: "https://example.test",
    secret: "a-test-secret-with-at-least-32-characters",
    database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
    databaseHooks: authAuditHooks,
    emailAndPassword: { enabled: true, autoSignIn: false },
    telemetry: { enabled: false }
  });

  const signUp = (requestId: string) =>
    auth.handler(
      new Request("https://example.test/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
          Origin: "https://example.test"
        },
        body: JSON.stringify({ name: "Example", email: "user@example.test", password: "test-password" })
      })
    );

  const created = await signUp("register-original");
  expect(created.status).toBe(200);
  const { user } = (await created.json()) as { user: { id: string } };
  expect((await signUp("register-duplicate")).status).toBe(200);

  expect(drain).toHaveBeenCalledTimes(1);
  expect(drain).toHaveBeenCalledWith(
    expect.objectContaining({
      event: expect.objectContaining({
        audit: expect.objectContaining({
          action: "user.create",
          actor: { type: "system", id: "better-auth" },
          target: { type: "user", id: user.id },
          outcome: "success",
          correlationId: "register-original"
        })
      })
    })
  );
  expect(JSON.stringify(drain.mock.calls)).not.toMatch(/user@example\.test|test-password/);
});
