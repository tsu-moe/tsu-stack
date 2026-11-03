import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    fsModuleCache: false,
    include: ["src/**/__tests__/*.test.ts"]
  }
});
