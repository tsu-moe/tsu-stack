# Vite+

Vite+ wraps the pinned pnpm workspace and runs Oxfmt, Oxlint, TypeScript, and Vitest. Use `vp install`, `vp add`, and `vp run <script>` for development. Use `vpx <package>` for one-off CLIs and `vp exec <command>` for an installed binary.

- `vp run -w <script>` runs a root script. Use `vp run --filter <package> <script>` for one workspace package and `vp run -r <script>` for all packages with that task.
- `vp config` sets up hooks through `prepare`. The staged hook runs `vp run fix`. Use `vp env doctor` for toolchain issues.
- The root [Vite config](../vite.config.ts) owns staging, formatting, lint behavior, and test defaults. The root `dev`, `check`, and `fix` scripts run an [i18n preflight](i18n.md).
- See [Workflow](workflow.md) for fix scope and timing.
