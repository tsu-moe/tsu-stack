# Workflow

## Essential Commands

| Command         | Purpose                                                               |
| --------------- | --------------------------------------------------------------------- |
| `vp run dev`    | Start all dev servers                                                 |
| `vp check`      | Run package-local format, lint, and typecheck for the current package |
| `vp run -w fix` | Format + lint + typecheck after substantial code/config work          |
| `vp run build`  | Build all packages                                                    |

## Validation Timing

Default to user-directed validation. Do not run `vp check`, `vp check --fix`, `vp run -w fix`, `vpr check`, `vpr fix`, root `check`/`fix` scripts, project-wide TypeScript checks, workspace builds, or equivalent broad validation unless the user explicitly asks for checks or approves them after being asked.

- For one-off changes, finish the requested edit, summarize what changed, and ask whether the user wants checks run before executing any check or fix command. If they do not ask for checks, wait for their next instruction.
- For larger planned work, such as implementing a `plan.md`, do not check every intermediate step unless explicitly told to. Run checks only at the end of the whole plan, or at substantial milestones/phases, and only when the user asked for that validation cadence.
- When the user does ask for validation, prefer the narrowest command that covers the touched surface. Use package-local `vp check` in the app or package changed when the work is scoped.
- Use `vp run -w fix`, `vp check --fix`, root `fix`, workspace TypeScript checks, or workspace builds only when the user explicitly asks for broad validation, fixing, or final plan validation.
- Do not reach for root filtered check commands when a package-local `vp check` covers the approved validation surface.

`vp run -w fix` formats (Oxfmt), lints (Oxlint), and type-checks in one pass. Treat it as an explicit user-requested action, not a default handoff step.

Do not run `vp run -w fix` for markdown-only edits, small documentation tweaks, or other changes that cannot affect formatting, linting, typechecking, build output, or runtime behavior unless the user explicitly asks. Staged files may be auto-checked on `git commit` via Vite Plus hooks; if the user asked for a commit but did not ask for checks, avoid triggering check hooks unless they explicitly approve them.

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

Follow [Testing policy](./testing.md). Do not add or run tests unless requested, except when an existing task explicitly calls for them.

## Commits

Use Conventional Commit format. Staging hooks may auto-run `vp check --fix` on staged files; do not rely on those hooks as hidden validation when the user has not approved checks.
