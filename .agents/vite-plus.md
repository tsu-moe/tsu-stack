# Vite Plus (Vite+)

## What It Is

Vite Plus is the all-in-one CLI that replaces pnpm/npm/yarn **and** bundles Oxlint, Oxfmt, Vitest, and staging hooks into a single `defineConfig` in the root `vite.config.ts`.

## CLI Mapping

| Instead of                     | Use                                   |
| ------------------------------ | ------------------------------------- |
| `pnpm` / `npm` / `yarn`        | `vp`                                  |
| `pnpx` / `npx`                 | `vpx`                                 |
| `pnpm run <script>`            | `vp run <script>`                     |
| `pnpm run -w <script>`         | `vp run -w <script>` (workspace root) |
| `pnpm --filter <pkg> <script>` | `vp run --filter <pkg> <script>`      |
| `pnpm add <dep>`               | `vp add <dep>`                        |
| `npx <pkg>`                    | `vpx <pkg>`                           |

## Key Behaviors

- `vp run -r <script>` — runs script recursively across all packages
- `vp check` — lint + typecheck
- `vp check --fix` — lint + typecheck + format (auto-runs on staged files via hooks)
- `vp config` — sets up Vite Plus hooks (runs on `prepare`)

## Root `vite.config.ts`

Contains the unified config for:

- **Staged hooks**: `"*": "vp check --fix"` — auto-formats + lints on commit
- **Vitest**: test includes, global config
- **Oxfmt**: ignore patterns, import sorting (by FSD layer), Tailwind class sorting
- **Oxlint**: ESLint plugin integration (`eslint-plugin-fsd-lint`, `@tanstack/eslint-plugin-query`, `eslint-plugin-react-hooks`)

## Mental Model

Think of `vp` as the **only CLI you need** for this project. It wraps pnpm for package management and Vite's ecosystem for build/lint/format/test. Never install or invoke pnpm/npm/yarn directly for standard development.
