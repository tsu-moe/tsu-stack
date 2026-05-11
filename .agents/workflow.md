# Workflow

## Essential Commands

| Command         | Purpose                                                               |
| --------------- | --------------------------------------------------------------------- |
| `vp run dev`    | Start all dev servers                                                 |
| `vp check`      | Run package-local format, lint, and typecheck for the current package |
| `vp run -w fix` | Format + lint + typecheck after substantial code/config work          |
| `vp run build`  | Build all packages                                                    |

## Validation Timing

Prefer narrow validation first.

- Use package-local `vp check` in the app or package you changed when the work is scoped.
- Use `vp run -w fix` after substantial multi-package work, before handoff for code/config changes, or when a task explicitly asks for broad validation.
- Do not reach for root filtered check commands when a package-local `vp check` covers the touched surface.

Run `vp run -w fix` after substantial code or config changes, before handing off completed implementation work, or when a task explicitly asks for full validation. It formats (Oxfmt), lints (Oxlint), and type-checks in one pass.

Do not run `vp run -w fix` for markdown-only edits, small documentation tweaks, or other changes that cannot affect formatting, linting, typechecking, build output, or runtime behavior unless the user explicitly asks. Staged files are also auto-checked on `git commit` via Vite Plus hooks.

## Auxiliary Static Analysis

Fallow is an auxiliary cleanup signal, not part of the default validation path.

- Prefer the usual workflow first: package-local `vp check` for scoped work and `vp run -w fix` for substantial code/config work.
- Use `vp run fallow` only after big features or broad refactors have landed, when extra dead-code, duplication, or drift signals are useful.
- Do not add Fallow to commit hooks, `fix`, or normal handoff validation unless the user explicitly asks.
- Treat Fallow findings as review prompts. Verify framework entry points, dynamic usage, generated files, and package boundaries before deleting or suppressing code.

## Feature Workflows

For end-to-end feature implementation order across `packages/db`, `packages/api`, and `apps/web`, use [End-to-end feature workflow](./end-to-end-features.md). Keep this file focused on validation timing, commands, and migration safety.

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

Follow [Testing policy](./testing.md). Do not add or run tests unless requested, except when an existing task explicitly calls for them.

## Commits

Conventional commit format automatically enforced by commitlint. Staging hooks auto-run `vp check --fix` on staged files.
