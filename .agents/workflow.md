# Workflow

## Essential Commands

| Command         | Purpose                                                  |
| --------------- | -------------------------------------------------------- |
| `vp run dev`    | Start all dev servers                                    |
| `vp run -w fix` | **Always run after changes** — format + lint + typecheck |
| `vp run test`   | Run all tests                                            |
| `vp run build`  | Build all packages                                       |

## After Every Change

Run `vp run -w fix`. This is the single validation gate — it formats (Oxfmt), lints (Oxlint), and type-checks in one pass. Staged files are also auto-checked on `git commit` via Vite Plus hooks.

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

## Installing shadcn Components

- **Shared** (reusable across apps): `vp run -w ui add <component>` → `packages/ui`
- **App-scoped** (web only): `vp run -w ui:web add <component>` → `apps/web`

Decide based on whether the component is a reusable atom across many apps, or specific to one app.

## Testing

Vitest or Playwright hasn't been set up yet. As long as `vp run -w fix` passes, no need to worry about tests unless requested.

## Commits

Conventional commit format automatically enforced by commitlint. Staging hooks auto-run `vp check --fix` on staged files.
