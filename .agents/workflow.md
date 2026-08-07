# Workflow

## Essential Commands

| Command          | Purpose                                                               |
| ---------------- | --------------------------------------------------------------------- |
| `vp run dev`     | Start all dev servers                                                 |
| `vp run check`   | Ensure Paraglide output exists, then check the workspace              |
| `vp check`       | Run package-local format, lint, and typecheck for the current package |
| `vp check --fix` | Run package-local format, lint fixes, and typecheck                   |
| `vp run -w fix`  | Ensure Paraglide output exists, then fix/check the workspace          |
| `vp run build`   | Build all packages                                                    |

## Validation Timing

Default to running fixes after making code or configuration changes. Run the narrowest fix command that covers the touched surface before handing work back to the user.

- For scoped app or package changes, run package-local `vp check --fix` from the changed app or package.
- For cross-package, root config, generated artifact, or workspace-wide changes, run `vp run -w fix`.
- For larger planned work, such as implementing a `plan.md`, run fixes often enough to catch drift: after substantial milestones/phases and once more before final handoff. Do not run a broad workspace fix after every tiny intermediate edit when a focused package fix or milestone fix covers the work.
- If a fix command fails, inspect the output, fix what is in scope, and rerun the same command until it passes or a real blocker remains.
- Do not reach for root filtered check commands when a package-local `vp check --fix` covers the changed surface.

`vp check --fix` and `vp run -w fix` format (Oxfmt), lint (Oxlint), and type-check in one pass. Treat fix commands as the normal cleanup and validation path after edits.

The root `dev`, `check`, and `fix` scripts run `i18n:ensure` first. This inline preflight only compiles Paraglide when a required generated entrypoint is missing; otherwise it is a filesystem-only no-op. Keep the preflight ahead of the parallel development processes so a fresh clone cannot start the web app before the Paraglide watcher produces its first runtime files.

For markdown-only edits, small documentation tweaks, or other changes that cannot affect formatting, linting, typechecking, build output, or runtime behavior, run an available narrow formatter/fix only when it applies cleanly to the touched surface. Otherwise, state that no code/config fix command was applicable. Staged files may be auto-checked on `git commit` via Vite Plus hooks; do not rely on those hooks as the first fix pass when edits have already been made.

## Completion Claims

- Do not report implementation, migration, validation, or cleanup work as complete until the relevant edits or commands have run and you have checked the resulting files or command output.
- If a workflow depends on generated artifacts or CLI state, verify that state directly instead of inferring completion from intent alone.

## Auxiliary Static Analysis

Fallow is an auxiliary cleanup signal, not part of the default validation path.

- Use `vp run fallow` only when the user explicitly asks for auxiliary cleanup signals after big features or broad refactors have landed.
- Do not add Fallow to commit hooks, `fix`, or normal handoff validation unless the user explicitly asks.
- Treat Fallow findings as review prompts. Verify framework entry points, dynamic usage, generated files, and package boundaries before deleting or suppressing code.

## Feature Workflows

For end-to-end feature implementation order across `packages/db`, `packages/core`, `packages/api`, and `apps/web`, use [End-to-end feature workflow](./end-to-end-features.md). Keep this file focused on validation timing, commands, and migration safety.

## Database Schema Changes

1. Edit schemas in `packages/db/src/schema/`
2. Run `vp run db:generate` to create migration files
3. Run `vp run db:migrate:local` to apply them to the local D1 database used by Wrangler.
4. Inspect the generated SQL and test locally before any remote migration.
5. `vp run deploy` applies remote D1 migrations before publishing the Worker. Run `vp run db:migrate:remote` separately only with explicit authorization and after confirming the Wrangler account and database binding.

## Other Commands

| Command                    | Purpose                       |
| -------------------------- | ----------------------------- |
| `vp run db:generate`       | Generate SQLite migrations    |
| `vp run db:migrate:local`  | Apply migrations to local D1  |
| `vp run db:migrate:remote` | Apply migrations to remote D1 |

## UI Components And shadcn

For UI component selection, shadcn install decisions, and visual coherence rules, use [UI guidelines](./ui.md). Keep the detailed UI policy there rather than duplicating it in workflow docs.

## Testing

Follow [Testing policy](./testing.md). Run the narrowest relevant tests when code changes affect behavior, contracts, bug fixes, or surfaces with nearby test coverage. Use e2e tests for browser workflows and integration paths that unit tests cannot cover.

## Commits

Use Conventional Commit format. Run the appropriate fix command before staging or committing code/config edits; do not rely on staging hooks as the first cleanup pass.
