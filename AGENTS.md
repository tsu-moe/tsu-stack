# tsu-stack

Opinionated full-stack TypeScript monorepo: TanStack Start + Hono + oRPC + Drizzle + Better Auth + Paraglide.js, powered by Vite Plus.

## Always

- Prefer direct solutions for current requirements. Add abstractions or helpers only when they improve readability, reuse, or testability.
- Keep control flow and types simple and close to their owners. Trust established internal invariants, but validate input, auth, external APIs, and persistence boundaries.
- Handle realistic edge cases in proportion to their impact. Comment only on non-obvious intent or constraints, explaining why.
- When building a business-critical feature, instrument its meaningful outcomes in the same change. Follow [Logging](.agents/logging.md).
- Update documentation only when the user asks or when a user-directed implementation change makes existing guidance inaccurate.
- Use `vp` for package/scripts and `vpx` for one-off CLIs. Before substantial work, run `vpx @tanstack/intent@latest list` and load a matching local skill only when it directly fits.

Common commands:

- `vp run dev` — start the development servers.
- `vp run check` — generate Paraglide output when needed, then check the workspace.
- `vp check --fix` — package-local formatting, lint fixes, and typecheck.
- `vp run -w fix` — workspace fix after cross-package or root changes.
- `vp run build` — build all packages.

## Guidance

Open the most specific guide first and follow its links only when the task crosses concerns.

- Workflow and tooling: [Workflow](.agents/workflow.md), [Vite+](.agents/vite-plus.md), [Testing](.agents/testing.md), [Choice flows](.agents/choice-flows.md).
- Web UI and data: [UI](.agents/ui.md), [Data flow](.agents/data-flow.md), [API fetching](.agents/api-fetching-patterns.md), [Zustand](.agents/zustand.md).
- Server and contracts: [oRPC](.agents/orpc.md), [oRPC testing](.agents/orpc-testing.md), [Auth](.agents/auth.md), [Core](.agents/core.md), [TypeScript](.agents/typescript.md).
- Platform concerns: [Database](.agents/database.md), [Environment variables](.agents/environment-variables.md), [Media storage](.agents/media-storage.md), [Logging](.agents/logging.md).
- Product concerns: [i18n](.agents/i18n.md), [SEO](.agents/seo.md), [End-to-end features](.agents/end-to-end-features.md).
- Scaffolding work: [CLI](.agents/cli.md).
