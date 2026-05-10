# UI Guidelines

Use this when adding or refactoring app-facing UI in `apps/web`.

This guide covers app-level UI decisions. For reusable component boundaries inside `packages/ui`, use [UI package patterns](./ui-package-patterns.md).

## Default Sources

- Prefer existing components from `@tsu-stack/ui/components/*` before creating new app-local primitives.
- Prefer app wrappers from `apps/web/src/shared/ui` when the app already owns routing, image, or other app-specific integration details.
- Use `lucide-react` for icons unless an existing asset or brand graphic is the better fit.
- Use `@tsu-stack/ui/lib/utils` `cn(...)` for class composition.

## shadcn Usage

- The repo uses shadcn with the `base-maia` style, `neutral` base color, CSS variables, and Lucide icons.
- Add reusable shadcn-derived components to `packages/ui` when they can stay app-agnostic.
- Keep a component in `apps/web` when it depends directly on app routing, auth, SEO, locale, or app config.
- Keep app-level wrappers and glue code in `apps/web/src/shared/ui`.

## Composition

- Build page UI in `pages/`, composite sections in `widgets/` and `features/`, and app-level primitives in `shared/ui`.
- Prefer composing `@tsu-stack/ui` primitives instead of duplicating styling across many leaf components.
- Keep route files thin. Put UI composition in page, feature, widget, or shared components, not in route files.
- Follow [TanStack patterns](./tanstack-patterns.md) for route/file placement.

## Images And Links

- Prefer app-owned wrappers for images or routing-aware links when the app needs locale, router, or env-specific behavior.
- Do not import app wrappers into `packages/ui`; use [UI package patterns](./ui-package-patterns.md) for dependency injection instead.
- Keep CDN, proxy, locale, and base URL logic outside shared UI primitives.

## Extraction Rule

- Extract a component to `packages/ui` when it is reusable, app-agnostic, and the shared package can own its styling and accessibility.
- Keep a component app-local when it depends on route params, current locale, auth state, app SEO, or other app-owned integrations.
