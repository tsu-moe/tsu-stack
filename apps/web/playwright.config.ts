import { defineConfig, devices } from "@playwright/test";

const E2E_ORIGIN = "http://127.0.0.1:3100";
const E2E_BASE_URL = `${E2E_ORIGIN}/web/`;

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
  use: {
    baseURL: E2E_BASE_URL,
    trace: "retain-on-failure"
  },
  webServer: {
    command: "vp run build && vp preview --host 127.0.0.1 --port 3100",
    env: {
      BETTER_AUTH_SECRET: "test-secret-at-least-32-characters-long",
      DATABASE_URL: "postgresql://invalid:invalid@127.0.0.1:1/tsu-stack-e2e",
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
