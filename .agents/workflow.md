# Workflow

Use `vp run dev` to start the workspace. Run `vp run check` to validate it and `vp run build` to compile all packages. See [Vite+](vite-plus.md) for tool usage.

## Changes and validation

- Prefer direct solutions. Keep logic and types with their owner, validate trust boundaries, and add helpers only for readability, reuse, or testing. Handle realistic failures proportionately. Comment on non-obvious intent or constraints.
- Update documentation when requested or when the change makes existing guidance inaccurate.
- After code or config changes, run `vp check --fix` from the owning package. Use `vp run -w fix` for cross-package, root, generated, or workspace changes. These commands format, lint, and typecheck. For larger work, run at meaningful milestones and before handoff. Fix issues in scope and rerun the same command. Run [focused tests](testing.md) after fixes.
- For Markdown-only changes, use the narrow formatter when applicable. Check generated output and command results before claiming completion. Use commit hooks as a backstop. Use Conventional Commits.
- Reserve `vp run fallow` for explicitly requested cleanup analysis. Verify findings against dynamic usage, entry points, generated files, and package boundaries before changing code. Keep it out of normal validation and hooks.

## Operations with side effects

Use disposable local resources for build, test, and smoke validation. Check the effective database before starting the app or Worker preview. Apply PostgreSQL migrations separately before Worker deployment. A standalone production Node startup can also run migrations.

Treat remote Wrangler mutations, provisioning, deployment, and release as operational work. Resolve the actual environment and get approval for the action and target before running the command. Include migrations or publication triggered by the command in that approval. Follow [Human decisions](choice-flows.md).

See [Database](database.md) for local migrations, [End-to-end features](end-to-end-features.md) for implementation order, and [Human decisions](choice-flows.md) when the next step depends on the user.
