# tsu-stack

Opinionated full-stack TypeScript monorepo: TanStack Start + Hono + oRPC + Drizzle + Better Auth + Paraglide.js (i18n), powered by Vite Plus.

## Critical Rules

- **Package manager**: Use `vp` (not pnpm/npm/yarn) and `vpx` (not npx/pnpx). See [Vite+ guide](.agents/vite-plus.md).
- **Validation**: Follow [Workflow](.agents/workflow.md) for validation timing.
- **UI**: Follow [UI guidelines](.agents/ui.md) for components, icons, images, shadcn installs, and visual coherence.
- **i18n**: Follow [i18n guidelines](.agents/i18n.md) for copy keys, Paraglide codegen, and translation boundaries.
- **Routing/FSD**: Follow [TanStack patterns](.agents/tanstack-patterns.md) for routes, navigation wrappers, loaders, and import direction.

## Topic-Specific Guidelines

- [TanStack patterns](.agents/tanstack-patterns.md)
- [Auth patterns](.agents/auth.md)
- [TypeScript conventions](.agents/typescript.md)
- [UI guidelines](.agents/ui.md)
- [i18n guidelines](.agents/i18n.md)
- [Testing policy](.agents/testing.md)
- [Workflow](.agents/workflow.md)
- [Vite+ toolchain](.agents/vite-plus.md)
- [Environment variables](.agents/environment-variables.md)

<!-- intent-skills:start -->

# Skill mappings — when working in these areas, load the linked skill file into context.

skills:

- task: "TanStack Router routes, layouts, route tree, navigation, loaders, and data fetching"
  load: "apps/web/node_modules/@tanstack/react-router/dist/llms/index.js"

- task: "TanStack Start app structure, server functions, SSR patterns, and middleware"
  load: "apps/web/node_modules/@tanstack/react-start/skills/react-start/SKILL.md"

<!-- intent-skills:end -->

## TanStack Docs

Use `vp run tanstack` to query official documentation. Always pass `--json`.

```sh
vp run tanstack libraries --json
vp run tanstack doc router framework/react/guide/data-loading --json
vp run tanstack search-docs "loaders" --library router --framework react --json
```
