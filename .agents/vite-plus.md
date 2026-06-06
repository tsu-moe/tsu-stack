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
- `vp env doctor` — checks the environment for potential issues, use when environment config seems wrong.

Use these check/fix commands only when the user explicitly asks for validation or approves it after being asked. For one-off edits, follow the native UI or structured input priority in [Choice flows](./choice-flows.md) to ask whether the user wants to skip validation, run `vp check`, or run a fix command so the agent can clean up auto-fixable errors. Do not end by merely saying validation was skipped. For the full validation cadence, including larger `plan.md` work, follow [Workflow](./workflow.md).

## Root `vite.config.ts`

Contains the unified config for:

- **Staged hooks**: `"*": "vp check --fix"` — auto-formats + lints on commit
- **Vitest**: test includes, global config
- **Oxfmt**: ignore patterns, import sorting (by FSD layer), Tailwind class sorting
- **Oxlint**: ESLint plugin integration (`eslint-plugin-fsd-lint`, `@tanstack/eslint-plugin-query`, `eslint-plugin-react-hooks`)

## Mental Model

Think of `vp` as the **only CLI you need** for this project. It wraps pnpm for package management and Vite's ecosystem for build/lint/format/test. Never install or invoke pnpm/npm/yarn directly for standard development.
