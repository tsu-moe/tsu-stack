# tsu-stack

Opinionated full-stack TypeScript monorepo: TanStack Start + Hono + oRPC + Drizzle + Better Auth + Paraglide.js (i18n), powered by Vite Plus.

## Start Here

- Start with the most specific `.agents/*.md` file for the task.
- Follow links from that file for adjacent context instead of reading several docs up front.
- Keep guidance in its owning file. Link instead of repeating rules across docs.

## Cross-Cutting Docs

- [Vite+ toolchain](.agents/vite-plus.md) for package management, workspace scripts, and CLI syntax.
- [Workflow](.agents/workflow.md) for user-directed validation timing, build checks, and migration safety.
- [Choice flows](.agents/choice-flows.md) for native approvals, structured input, validation prompts, and human decision points.
- [Logging](.agents/logging.md) only when adding, changing, or keeping durable logs.
- [Testing](.agents/testing.md) only when tests are explicitly requested or the task is test-specific.

## Topic Index

Pick the most specific file for the task. Use links within that file instead of reading the whole docs tree linearly.

### Delivery Flows

- [End-to-end feature workflow](.agents/end-to-end-features.md) for full-stack feature work spanning `packages/db`, `packages/core`, `packages/api`, and `apps/web`.

### App And Frameworks

- [TanStack patterns](.agents/tanstack-patterns.md) for route structure, `beforeLoad`, layouts, and route-level preloading.
- [API fetching patterns](.agents/api-fetching-patterns.md) for slice-local TanStack Query and oRPC client wrappers in `apps/web`.
- [Zustand state management](.agents/zustand.md) for complex client-owned state shared across components, and for avoiding React Context as the default mutable state tool.
- [oRPC patterns](.agents/orpc.md) for server procedures, router shape, typed errors, and request-scoped handler logging.
- [Auth patterns](.agents/auth.md) for Better Auth architecture, auth query behavior, and protected/guest route rules.
- [i18n guidelines](.agents/i18n.md) for copy keys, locale file policy, and Paraglide codegen.
- [SEO patterns](.agents/seo.md) for route `head()` usage and `@tsu-stack/seo` integration.

### Shared Packages And Platform

- [Core package patterns](.agents/core.md) for shared domain contracts in `packages/core`, file roles, and propagation into API and web code.
- [Media storage and uploads](.agents/media-storage.md) for preemptive S3 object conventions, first-implementation workflow, delete policy, and storage env configuration.
- [UI guidelines](.agents/ui.md) for app UI composition, extraction decisions, and `packages/ui` boundaries.
- [TypeScript conventions](.agents/typescript.md) for schema placement, import boundaries, and `lib/` vs `utils/`.
- [Environment variables](.agents/environment-variables.md) for env scoping, validation, and Docker propagation.

## Task Entry Points

- UI work: Start with [UI guidelines](.agents/ui.md). Add [TanStack patterns](.agents/tanstack-patterns.md) when the task touches route/file placement, loaders, or page composition. Add [Zustand state management](.agents/zustand.md) when client state must be accessed from different components.
- Shared client state: Start with [Zustand state management](.agents/zustand.md). Do not use React Context unless the user explicitly asks for it.
- Bugfix: Start with the owning domain doc from the index above, then use [Workflow](.agents/workflow.md) for user-directed validation timing. Add [Core package patterns](.agents/core.md) when the fix touches shared enums, schemas, formatters, defaults, or other cross-package contracts. Add [Logging](.agents/logging.md) or [Testing](.agents/testing.md) only when the task explicitly calls for them or their policies require them.
- Uploads or object storage: Start with [Media storage and uploads](.agents/media-storage.md). Use it even for the first storage feature in this repo, then update it in the same change once the real provider, env surface, and asset purposes are known. Add [Core package patterns](.agents/core.md) when changing shared upload contracts, [oRPC patterns](.agents/orpc.md) when wiring route handlers, and [Environment variables](.agents/environment-variables.md) when storage config changes.
- End-to-end feature: Start with [End-to-end feature workflow](.agents/end-to-end-features.md), then load the relevant domain docs such as [Core package patterns](.agents/core.md), [oRPC patterns](.agents/orpc.md), [API fetching patterns](.agents/api-fetching-patterns.md), [TanStack patterns](.agents/tanstack-patterns.md), [Zustand state management](.agents/zustand.md), [Auth patterns](.agents/auth.md), or [UI guidelines](.agents/ui.md).

<!-- intent-skills:start -->

## Skill Loading

Before substantial work:

- Skill check: run `vpx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `vpx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

## TanStack Docs

Use `pnpm tanstack` (aliased to `vpx @tanstack/cli@latest`) to look up TanStack documentation. Always pass `--json` for machine-readable output.

```bash
# List TanStack libraries (optionally filter by --group state|headlessUI|performance|tooling)
pnpm tanstack libraries --json

# Fetch a specific doc page
pnpm tanstack doc router framework/react/guide/data-loading --json
pnpm tanstack doc query framework/react/overview --docs-version v5 --json

# Search docs (optionally filter by --library, --framework, --limit)
pnpm tanstack search-docs "server functions" --library start --json
pnpm tanstack search-docs "loaders" --library router --framework react --json
```
