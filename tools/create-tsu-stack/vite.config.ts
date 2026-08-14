import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    clean: true,
    deps: {
      alwaysBundle: [/./],
      onlyBundle: false
    },
    dts: false,
    entry: "./src/index.ts",
    format: "esm",
    minify: true,
    outDir: "./.output",
    sourcemap: true
  },
  test: {
    include: ["src/**/__tests__/*.test.ts"]
  }
});
