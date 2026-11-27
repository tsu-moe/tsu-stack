# tsu-stack

Full-stack TypeScript monorepo with TanStack Start, Hono, oRPC, Drizzle, Better Auth, and Paraglide.js.

Use Vite+ with the pinned pnpm workspace (`vp` for scripts and packages, `vpx` for one-off CLIs). Run `vp run check` to validate and `vp run build` to build.

When implementing features or adopting new preferences, always ask whether the user wants related updates to `AGENTS.md` or `.agents/`. If the requested change would override an existing convention, explain the conflict and wait for confirmation before implementing the conflicting change. Edit agent documentation only after the user approves the proposed edit or explicitly requests it. Apply approved updates alongside the feature.

- [Project organization](.agents/organization.md) for file ownership, layers, and imports.
- [Workflow](.agents/workflow.md) for skills, verification, and operational approvals.
- [Implementation guides](.agents/end-to-end-features.md) for web, API, and platform work.
- [Scaffolding CLI](.agents/cli.md).
