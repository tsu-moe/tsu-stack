# tsu-stack

Opinionated full-stack TypeScript monorepo: TanStack Start + Hono + oRPC + Drizzle + Better Auth + Paraglide.js, powered by Vite Plus.

## Code style

- Prefer straightforward solutions for current requirements. Introduce abstractions, generic utilities, extensibility, or architectural layers only when there is a concrete need.
- Keep the main control flow easy to follow. Avoid wrapper layers that merely rename or forward calls and fragmentation that creates unnecessary jumps between files or functions.
- Extract helpers only when they meaningfully improve readability, reuse, or testability.
- Keep types simple and close to where they are used. Prefer inference and avoid type gymnastics unless necessary.
- Be robust at system boundaries such as user input, auth, external APIs, and persistence. Within trusted boundaries, rely on established invariants instead of guarding against hypothetical states.
- Handle edge cases in proportion to their likelihood and impact. Avoid complexity for contrived, extremely unlikely, low-impact scenarios while preserving security and data-integrity requirements.
- Add concise comments only for non-obvious intent, unusual edge cases, and important constraints. Explain why, not what.

Use Vite Plus commands in this repo: `vp` for package/scripts, `vpx` for one-off CLIs.

Common commands:

- `vp run dev` - start dev servers
- `vp run check` - generate Paraglide output when missing, then check the workspace
- `vp check --fix` - package-local format, lint fixes, and typecheck
- `vp run -w fix` - workspace fix after cross-package/root changes
- `vp run build` - build all packages

Before substantial work, run `vpx @tanstack/intent@latest list`; load a matching local skill only when it directly fits the task.

Use the smallest relevant doc set below. Open the most specific file first, then follow links from that file only when the task crosses into another concern.

## Cross-Cutting

- [Workflow](.agents/workflow.md): fix cadence, validation scope, build checks, migrations, commits.
- [Vite+ toolchain](.agents/vite-plus.md): `vp`/`vpx`, workspace scripts, package management.
- [Testing](.agents/testing.md): focused unit/e2e coverage and test command scope.
- [Database conventions](.agents/database.md): Drizzle column types and generated Better Auth schema ownership.
- [Choice flows](.agents/choice-flows.md): native approvals, structured input, human decision points.
- [Logging](.agents/logging.md): durable logs, request logging, redaction, client/server logging.
- [Scaffolding CLI](.agents/cli.md): generator architecture, template compatibility, tests, and releases.

## Task Entry Points

- UI work: [UI guidelines](.agents/ui.md). Add [Data flow](.agents/data-flow.md) for routes/loaders/page composition, and [Zustand state management](.agents/zustand.md) for shared client-owned state.
- Shared client state: [Zustand state management](.agents/zustand.md).
- Tests or test requests: [Testing](.agents/testing.md), plus the owning domain guide. Add [oRPC testing](.agents/orpc-testing.md) for procedures or oRPC-backed client behavior.
- Bugfix: start with the owning domain doc, then [Workflow](.agents/workflow.md). Add [Testing](.agents/testing.md) for regression coverage and [Core package patterns](.agents/core.md) when shared contracts change.
- Uploads or object storage: [Media storage and uploads](.agents/media-storage.md), plus [Core](.agents/core.md), [oRPC](.agents/orpc.md), and [Environment variables](.agents/environment-variables.md) as needed.
- End-to-end feature: [End-to-end feature workflow](.agents/end-to-end-features.md), then the domain docs it links.

## Domain Docs

- [Data flow](.agents/data-flow.md): Router/Query responsibilities, route structure, cache behavior, mutations, and server boundaries.
- [API fetching patterns](.agents/api-fetching-patterns.md): slice-local TanStack Query and oRPC client wrappers in `apps/web`.
- [oRPC patterns](.agents/orpc.md): server procedures, router shape, typed errors, request-scoped handler logging.
- [oRPC testing](.agents/orpc-testing.md): direct procedure calls, typed error assertions, context fixtures, and transport-test boundaries.
- [Auth patterns](.agents/auth.md): Better Auth architecture, auth query behavior, protected/guest route rules.
- [i18n guidelines](.agents/i18n.md): copy keys, locale file policy, Paraglide codegen.
- [SEO patterns](.agents/seo.md): route `head()` usage and `@tsu-stack/seo`.
- [Core package patterns](.agents/core.md): shared domain contracts in `packages/core`.
- [TypeScript conventions](.agents/typescript.md): schema placement, import boundaries, `lib/` vs `utils/`.
- [Environment variables](.agents/environment-variables.md): env scoping, validation, Docker propagation.
