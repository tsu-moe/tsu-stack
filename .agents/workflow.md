# Workflow

## Essential Commands

| Command          | Purpose                                                               |
| ---------------- | --------------------------------------------------------------------- |
| `vp run dev`     | Start all dev servers                                                 |
| `vp check`       | Run package-local format, lint, and typecheck for the current package |
| `vp check --fix` | Run package-local format, lint fixes, and typecheck                   |
| `vp run -w fix`  | Format + lint + typecheck after substantial code/config work          |
| `vp run build`   | Build all packages                                                    |

## Validation Timing

Default to running fixes after making code or configuration changes. Run the narrowest fix command that covers the touched surface before handing work back to the user.

- For scoped app or package changes, run package-local `vp check --fix` from the changed app or package.
- For cross-package, root config, generated artifact, or workspace-wide changes, run `vp run -w fix`.
- For larger planned work, such as implementing a `plan.md`, run fixes often enough to catch drift: after substantial milestones/phases and once more before final handoff. Do not run a broad workspace fix after every tiny intermediate edit when a focused package fix or milestone fix covers the work.
- If a fix command fails, inspect the output, fix what is in scope, and rerun the same command until it passes or a real blocker remains.
- Do not reach for root filtered check commands when a package-local `vp check --fix` covers the changed surface.

`vp check --fix` and `vp run -w fix` format (Oxfmt), lint (Oxlint), and type-check in one pass. Treat fix commands as the normal cleanup and validation path after edits.

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
3. **Check `DATABASE_URL`** — must point to localhost/127.0.0.1. If it looks like a production URL, **stop and warn the user**.
4. Run `vp run db:migrate` to apply. Features will silently fail without applied migrations.

## Other Commands

| Command               | Purpose                         |
| --------------------- | ------------------------------- |
| `vp run db:dev:start` | Start local PostgreSQL (Docker) |
| `vp run db:dev:stop`  | Stop local PostgreSQL           |
| `vp run db:generate`  | Generate migration files        |
| `vp run db:migrate`   | Apply migrations                |
| `vp run db:studio`    | Open Drizzle Studio             |

## UI Components And shadcn

For UI component selection, shadcn install decisions, and visual coherence rules, use [UI guidelines](./ui.md). Keep the detailed UI policy there rather than duplicating it in workflow docs.

## Testing

Follow [Testing policy](./testing.md). Run the narrowest relevant tests when code changes affect behavior, contracts, bug fixes, or surfaces with nearby test coverage. Use e2e tests for browser workflows and integration paths that unit tests cannot cover.

## Commits

Use Conventional Commit format. Run the appropriate fix command before staging or committing code/config edits; do not rely on staging hooks as the first cleanup pass.
