# Workflow

Use `vp run dev` to start the workspace. Before substantial work, run `vpx @tanstack/intent@latest list` and load the installed skills relevant to the task. See [Vite+](vite-plus.md) for tool usage.

## Changes and validation

- Keep project documentation accurate. For changes to `AGENTS.md` or `.agents/`, follow the [repository guidance policy](../AGENTS.md). Ask only when the request conflicts with an existing convention and the user has yet to resolve the conflict.
- After code or config changes, run `vp check --fix` from the owning package. Use `vp run -w fix` for cross-package, root, generated, or workspace changes. These commands format, lint, and typecheck. For larger work, run at meaningful milestones and before handoff. Fix issues in scope and rerun the same command. Run [focused tests](testing.md) after fixes.
- For Markdown-only changes, use the narrow formatter when applicable. Check generated output and command results before claiming completion. Use commit hooks as a backstop. Use Conventional Commits and task-based branch prefixes such as `feat/` and `fix/`.
- Reserve `vp run fallow` for explicitly requested cleanup analysis. Verify findings against dynamic usage, entry points, generated files, and package boundaries before changing code. Keep it out of normal validation and hooks.

## Operations with side effects

Use disposable local resources for build, test, and smoke validation. Get explicit approval before changing an existing database. Check the effective database before starting the app. Production startup can apply pending migrations, and `vp run docker:up` and `vp run docker:up:build` can run a Compose migrator. Verify the effective Docker context, Compose project, and database before starting either path.

Treat remote Wrangler mutations, provisioning, deployment, and release as operational work. Resolve the actual environment and get explicit approval for the action and target before running the command. Include migrations or publication triggered by the command in that approval. Follow [Human decisions](choice-flows.md).

See [Database](database.md) for local migrations, [End-to-end features](end-to-end-features.md) for implementation order, and [Human decisions](choice-flows.md) when the next step depends on the user.
