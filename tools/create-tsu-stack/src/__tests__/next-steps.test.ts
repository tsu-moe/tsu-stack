import { describe, expect, it } from "vite-plus/test";

import { buildNextSteps } from "#@/next-steps";

describe("buildNextSteps", () => {
  it("shows only commands and a final optional D1 remote setup", () => {
    expect(
      buildNextSteps({
        install: true,
        projectDirectory: "my-app",
        setup: "none",
        variant: "cloudflare-d1"
      })
    ).toBe(`cd "my-app"
cp packages/env/.env.example packages/env/.env
vp run db:migrate:local
vp run dev

OPTIONAL:
vp exec wrangler login
# Follow .github/README.md for remote setup`);
  });

  it("does not repeat remote setup after Cloudflare provisioning", () => {
    expect(
      buildNextSteps({
        install: true,
        projectDirectory: "my-app",
        setup: "cloudflare",
        variant: "cloudflare-d1"
      })
    ).toBe(`cd "my-app"
vp run dev`);
  });

  it("includes installation and PostgreSQL commands when needed", () => {
    expect(
      buildNextSteps({
        install: false,
        projectDirectory: "my-app",
        setup: "none",
        variant: "separate"
      })
    ).toBe(`cd "my-app"
vp install
cp packages/env/.env.example packages/env/.env
vp run db:dev:start
vp run db:migrate
vp run dev`);
  });
});
