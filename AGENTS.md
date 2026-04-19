# tsu-stack

Opinionated full-stack TypeScript monorepo: TanStack Start + Hono + oRPC + Drizzle + Better Auth + Paraglide.js (i18n), powered by Vite Plus.

## Critical Rules

- **Package manager**: Use `vp` (not pnpm/npm/yarn) and `vpx` (not npx/pnpx). See [Vite+ guide](.agents/vite-plus.md).
- **After any change**: Run `vp run -w fix` to format + lint + typecheck.
- **Icons**: Use `lucide-react`. Only use `react-icons` for brand icons or when lucide lacks the icon.
- **Shared UI**: Install to `packages/ui` with `vp run -w ui add <x>` for cross-app atoms. Use `vp run -w ui:web add <x>` for app-scoped components.
- **Images**: Use the `<Image>` component from `apps/web/src/shared/ui/image.tsx` for automatic optimization. Do not use `<img>` directly.
- **Navigation**: Always use `<Link>`, `useNavigate`, `redirect` from `@tsu-stack/i18n` — never from `@tanstack/react-router` directly.
- **FSD imports**: Imports only go downward: routes → pages → widgets → features → entities → shared. Start specialized in `pages/`, generalize only when reused.

## Topic-Specific Guidelines

- [TanStack patterns](.agents/tanstack-patterns.md)
- [Auth patterns](.agents/auth.md)
- [TypeScript conventions](.agents/typescript.md)
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
