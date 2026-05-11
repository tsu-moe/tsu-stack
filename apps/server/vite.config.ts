import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    clean: true,
    deps: {
      alwaysBundle: [/./],
      onlyBundle: false
    },
    dts: true,
    entry: "./src/index.ts",
    exe: process.env.BUILD_EXE === "true",
    format: "esm",
    minify: true,
    outDir: "./.output",
    sourcemap: true
  }
});
