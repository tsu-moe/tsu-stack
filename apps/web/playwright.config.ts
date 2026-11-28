import { defineConfig, devices } from "@playwright/test";

const E2E_ORIGIN = "http://127.0.0.1:3100";
const E2E_BASE_URL = `${E2E_ORIGIN}/web/`;
const productionVariant = process.env.PLAYWRIGHT_PRODUCTION_VARIANT;

function fixtureUrl(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} for the production smoke fixture.`);
  const url = new URL(value);
  if (url.hostname !== "127.0.0.1") throw new Error(`Use a loopback URL for ${name}.`);
  return url;
}

function productionServers(variant: string) {
  if (!["separate", "merged", "cloudflare", "cloudflare-d1"].includes(variant)) {
    throw new Error(`Unknown production smoke variant: ${variant}.`);
  }
  if (variant !== "cloudflare-d1") fixtureUrl("DATABASE_URL");

  const web = fixtureUrl("VITE_WEB_URL");
  const api = fixtureUrl("VITE_SERVER_URL");
  const cloudflare = variant.startsWith("cloudflare");
  const options = { reuseExistingServer: false, timeout: 120_000 };

  return [
    ...(variant === "separate"
      ? [
          {
            ...options,
            command: "node ../server/.output/index.mjs",
            env: { HOST: api.hostname, NODE_ENV: "production", PORT: api.port },
            name: "Production API",
            url: `${api.href.replace(/\/$/, "")}/health/live`
          }
        ]
      : []),
    {
      ...options,
      command: cloudflare
        ? `vp preview --host 127.0.0.1 --port ${web.port} --strictPort`
        : "node .output/server/index.mjs",
      env: { HOST: web.hostname, NODE_ENV: "production", PORT: web.port },
      name: "Production web",
      url: web.href
    }
  ];
}

const baseURL = productionVariant ? `${fixtureUrl("VITE_WEB_URL").href.replace(/\/$/, "")}/` : E2E_BASE_URL;

export default defineConfig({
  outputDir: "./.cache/playwright",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  reporter: "list",
  testDir: "./__e2e__",
  testIgnore: productionVariant ? [] : "**/production.spec.ts",
  use: {
    baseURL,
    trace: "retain-on-failure"
  },
  webServer: productionVariant
    ? productionServers(productionVariant)
    : {
        command: "vp run --no-cache build && vp preview --host 127.0.0.1 --port 3100",
        env: {
          BETTER_AUTH_SECRET: "test-secret-at-least-32-characters-long",
          SOURCE_COMMIT: "e2e",
          VITE_IMGPROXY_SIGNATURE: "_",
          VITE_SERVER_URL: "http://127.0.0.1:3199/server",
          VITE_WEB_URL: E2E_BASE_URL
        },
        reuseExistingServer: false,
        timeout: 120_000,
        url: E2E_BASE_URL
      }
});
