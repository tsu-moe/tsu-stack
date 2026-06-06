# End-to-End Feature Workflow

Use this when implementing a feature that spans data model, shared domain contracts, API, and web UI.

This file defines implementation order. For package-specific rules, follow the linked docs instead of repeating them here.

When a feature introduces shared contracts that should drive both API and frontend behavior, this workflow also includes `packages/core`.

## Default Order

1. If the feature needs new data or persisted fields, update `packages/db` first.
2. If the feature introduces shared enums, schemas, formatters, or defaults consumed across packages, update `packages/core` next.
3. Define or extend the oRPC contract in `packages/api`.
4. Add slice-local TanStack Query wrappers in `apps/web`.
5. Handle user-visible client errors using the typed oRPC client pattern.
6. Wire route preloading, guards, and UI composition in `apps/web`.
7. Ask for or run validation only according to the user-approved cadence in [Workflow](./workflow.md), using [Choice flows](./choice-flows.md) when a human decision is needed.

## Step 1: Database

- Edit schemas in `packages/db/src/schema/` when the feature changes persisted data.
- Follow [Workflow](./workflow.md) for migration generation, localhost `DATABASE_URL` safety, and migration application.
- Keep schema and migration work complete before defining API output shapes that depend on it.

## Step 2: Shared Domain Contract

- Use `packages/core` for shared Zod schemas, enums, normalizers, formatters, option builders, and defaults consumed by more than one package.
- Follow [Core package patterns](./core.md).
- Unless explicitly told not to, if a change should propagate automatically into both API and frontend behavior, centralize it in `packages/core` instead of duplicating literals in app code.
- Route validators, frontend filters, and shared API input or output schemas should import core contracts when they represent the same domain surface.

## Step 3: API Contract

- Add or extend the router in `packages/api`.
- Follow [oRPC patterns](./orpc.md) for procedure factories, explicit `input` and `output` schemas, and typed errors.
- Prefer type-safe errors with `.errors(...)` and `errors.MY_ERROR(...)` for expected failure cases the client needs to handle.

## Step 4: Web Data Layer

- Use oRPC's TanStack Query integration from `@tsu-stack/api/client/tanstack-start/orpc`.
- Follow [API fetching patterns](./api-fetching-patterns.md) for `*.query.ts`, `*.mutation.ts`, query keys, query options, and hook wrappers.
- Keep `orpc` and TanStack Query wiring inside slice-local `api/` files, not inline in page components.

## Step 5: Client Error Handling

- For user-visible failure states, follow the type-safe client error pattern in [oRPC patterns](./orpc.md).
- Do not duplicate string-matched or ad hoc client error handling in web slices when the server already defines typed oRPC errors.

## Step 6: Routes And UI

- Follow [TanStack patterns](./tanstack-patterns.md) for route placement, thin `beforeLoad`, and page composition.
- Follow [UI guidelines](./ui.md) for app-level component composition.
- Add [Auth patterns](./auth.md), [SEO patterns](./seo.md), or [i18n guidelines](./i18n.md) when the feature touches those surfaces.

## Validation

- Follow [Workflow](./workflow.md) for user-directed validation timing and [Choice flows](./choice-flows.md) for human validation decisions. For larger planned work, such as implementing a `plan.md`, validate at the end of the plan or at substantial milestones/phases only when that cadence was requested or approved. Follow [Testing](./testing.md) only when tests are explicitly requested or the task is test-specific.
