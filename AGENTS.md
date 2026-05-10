# tsu-stack

Opinionated full-stack TypeScript monorepo: TanStack Start + Hono + oRPC + Drizzle + Better Auth + Paraglide.js (i18n), powered by Vite Plus.

## How To Use These Docs

- Start with the most specific `.agents/*.md` file for the task.
- If a task spans multiple topics, follow the most specific doc and use linked docs for adjacent context.
- Keep guidance isolated to its owning file. Link to other docs instead of repeating their rules.

## Always Apply

- [Vite+ toolchain](.agents/vite-plus.md) for package management, workspace scripts, and CLI syntax.
- [Workflow](.agents/workflow.md) for validation timing, focused checks, and migration workflow.
- [Logging](.agents/logging.md) before adding, changing, or retaining durable logs.
- [Testing](.agents/testing.md) before creating, modifying, or running tests.

## Topic Index

### Delivery Flows

- [End-to-end feature workflow](.agents/end-to-end-features.md) for full-stack feature work spanning `packages/db`, `packages/api`, and `apps/web`.

### App And Frameworks

- [TanStack patterns](.agents/tanstack-patterns.md) for route structure, `beforeLoad`, layouts, and route-level preloading.
- [API fetching patterns](.agents/api-fetching-patterns.md) for slice-local TanStack Query and oRPC client wrappers in `apps/web`.
- [oRPC patterns](.agents/orpc.md) for server procedures, router shape, typed errors, and request-scoped handler logging.
- [Auth patterns](.agents/auth.md) for Better Auth architecture, auth query behavior, and protected/guest route rules.
- [i18n guidelines](.agents/i18n.md) for copy keys, locale file policy, and Paraglide codegen.
- [SEO patterns](.agents/seo.md) for route `head()` usage and `@tsu-stack/seo` integration.

### Shared Packages And Platform

- [UI guidelines](.agents/ui.md) for app-level UI composition, shadcn usage, icons, images, and extraction decisions.
- [UI package patterns](.agents/ui-package-patterns.md) for keeping `packages/ui` reusable and app-agnostic.
- [TypeScript conventions](.agents/typescript.md) for schema placement, import boundaries, and `lib/` vs `utils/`.
- [Environment variables](.agents/environment-variables.md) for env scoping, validation, and Docker propagation.
- [Logging](.agents/logging.md) for evlog structure, redaction, identity, and request/client logging.
- [Vite+ toolchain](.agents/vite-plus.md) for `vp`/`vpx` behavior and repo command equivalents.
- [Workflow](.agents/workflow.md) for validation timing and database schema workflows.
- [Testing](.agents/testing.md) for the repo's no-tests-unless-requested policy and test layout.

## Task Entry Points

- UI fix: Start with [UI guidelines](.agents/ui.md). Add [TanStack patterns](.agents/tanstack-patterns.md) when the fix touches routes, loaders, or page composition.
- Bugfix: Start with the owning domain doc from the index above, then use [Workflow](.agents/workflow.md) for narrow validation. Add [Logging](.agents/logging.md) or [Testing](.agents/testing.md) only when the task explicitly calls for them or their policies require them.
- Test work: Start with [Testing](.agents/testing.md), then load the owning domain doc so the tests match the real feature boundaries.
- End-to-end feature: Start with [End-to-end feature workflow](.agents/end-to-end-features.md), then load the relevant domain docs such as [oRPC patterns](.agents/orpc.md), [API fetching patterns](.agents/api-fetching-patterns.md), [TanStack patterns](.agents/tanstack-patterns.md), [Auth patterns](.agents/auth.md), or [UI guidelines](.agents/ui.md).

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

## Maintenance Rule

If a rule already belongs to another `.agents/*.md` file, link to that file instead of restating it here or copying it into another topic doc.
