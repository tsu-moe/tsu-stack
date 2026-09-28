import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    clean: true,
    deps: {
      // tsdown <0.23 compatibility: resolve external dependency subpaths.
      // Remove to preserve subpath imports as written (the new default).
      // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
      resolveDepSubpath: true,
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
