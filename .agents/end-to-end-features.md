# End-to-End Feature Workflow

Use this when implementing a feature that spans data model, API, and web UI.

This file defines implementation order. For package-specific rules, follow the linked docs instead of repeating them here.

## Default Order

1. If the feature needs new data or persisted fields, update `packages/db` first.
2. Define or extend the oRPC contract in `packages/api`.
3. Add slice-local TanStack Query wrappers in `apps/web`.
4. Wire route preloading, guards, and UI composition in `apps/web`.
5. Validate the touched packages before broad workspace validation.

## Step 1: Database

- Edit schemas in `packages/db/src/schema/` when the feature changes persisted data.
- Follow [Workflow](./workflow.md) for migration generation, localhost `DATABASE_URL` safety, and migration application.
- Keep schema and migration work complete before defining API output shapes that depend on it.

## Step 2: API Contract

- Add or extend the router in `packages/api`.
- Follow [oRPC patterns](./orpc.md) for procedure factories, explicit `input` and `output` schemas, and typed errors.
- Prefer type-safe errors with `.errors(...)` and `errors.MY_ERROR(...)` for expected failure cases the client needs to handle.

## Step 3: Web Data Layer

- Use oRPC's TanStack Query integration from `@tsu-stack/api/client/tanstack-start/orpc`.
- Follow [API fetching patterns](./api-fetching-patterns.md) for `*.query.ts`, `*.mutation.ts`, query keys, query options, and hook wrappers.
- Keep `orpc` and TanStack Query wiring inside slice-local `api/` files, not inline in page components.

## Step 4: Client Error Handling

- Use the type-safe oRPC client pattern for user-visible failure states.
- Narrow errors with `isDefinedError(error)` from `@orpc/client`.
- Branch on `error.code` and use `error.data` only when that error defines typed data.
- Do not fall back to string-matching server messages for defined errors.
- If an AI-generated mutation handler ignores typed errors, explicitly steer it to use the type-safe pattern from [oRPC patterns](./orpc.md).

## Step 5: Routes And UI

- Follow [TanStack patterns](./tanstack-patterns.md) for route placement, thin `beforeLoad`, and page composition.
- Follow [UI guidelines](./ui.md) for app-level component composition.
- Add [Auth patterns](./auth.md), [SEO patterns](./seo.md), or [i18n guidelines](./i18n.md) when the feature touches those surfaces.

## Validation

- Prefer narrow package-local `vp check` in the touched app or package first.
- Use [Workflow](./workflow.md) for broader validation timing.
- Follow [Testing](./testing.md) only when tests are explicitly requested or the task is test-specific.
