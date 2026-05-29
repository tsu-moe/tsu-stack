# Core Package Patterns

Use this when adding or refactoring shared domain logic in `packages/core`.

This file is the source of truth for what belongs in `packages/core`, how to structure it, and how shared contract changes should propagate through the repo.

## Goals

- Keep shared domain contracts in one place.
- Make API and frontend behavior follow shared changes by import, not by parallel manual edits.
- Keep `packages/core` runtime-agnostic and safe to consume from `packages/auth`, `packages/db`, `packages/api`, `apps/web`, and `apps/server`.

## What Belongs In `packages/core`

Put code in `packages/core` when at least one of these is true:

- The same domain contract is consumed by more than one package.
- A change should propagate automatically from shared logic into both API and frontend behavior.
- The code defines a shared constant, enum, filter, status, category, transport shape, normalizer, formatter, or option builder.
- The code is pure domain logic with no React, DB, env, logger, or network dependency.

Typical examples:

- Zod schemas and inferred types for shared transport-safe shapes.
- Shared enums such as categories, statuses, and sort values.
- Pure formatters and normalizers.
- Schema-derived option arrays and defaults used by filters, tabs, selects, or validators.
- Shared constants such as MIME types, upload limits, reserved values, or other package-agnostic constraints.

## What Does Not Belong In `packages/core`

- React components, hooks, route files, or TanStack Query wrappers.
- oRPC procedures, router handlers, or request middleware.
- Drizzle schema, SQL queries, migrations, or database access.
- Env loading, logger setup, storage clients, or other side-effectful integrations.
- One-off app-only view logic unless the task explicitly calls for divergence from the shared contract.
- One-off utilities or library functions that are not derived from or directly related to the shared contract, they should be placed within their respective package or slice.

## Default Folder Shape

Shared domain modules in `packages/core` should usually look like this:

```text
src/<domain>/
  constants.ts
  types.ts
  utils.ts
  index.ts
```

### `constants.ts`

Use this for support constants that back the domain but are not themselves the primary cross-package contract.

Examples:

- MIME type lists
- byte limits
- reserved values
- expiry durations

If the value is a shared contract that API and frontend validate against, it usually belongs in `types.ts` as a Zod schema instead.

### `types.ts`

Use this for shared Zod schemas and inferred types.

- Put cross-layer enums here, even when they are simple literal sets.
- Export both the schema and the inferred type as named exports.
- Export schema-derived defaults here when they are part of the shared contract surface.
- Prefer one shared schema over duplicated literal unions in consumers.

### `utils.ts`

Use this for pure helpers derived from the shared contract.

- formatters
- normalizers
- schema-derived option arrays
- shared defaulting helpers

Prefer deriving labels and UI options from shared schema values instead of introducing parallel frontend arrays or label unions.

### `index.ts`

Keep a small domain barrel that re-exports the public API for that domain.

Consumers should import the domain surface, not deep internal files.

## Propagation Rule

Unless explicitly told not to, shared domain enums and validation logic should propagate from `packages/core` into both the frontend and API.

That means:

- `apps/web` route validators should import shared schemas and defaults from core instead of repeating `z.enum([...])` literals.
- Frontend filters, tabs, and select options should use core-derived helpers or schema values, not duplicated local arrays.
- `packages/api` procedures should validate shared inputs and outputs with core schemas when the contract crosses package boundaries.
- Slice query modules in `apps/web` may re-export shared types for convenience, but they should not redefine local literal unions if core already owns the contract.

If adding one enum value requires hand-editing multiple literal unions in `apps/web` or `packages/api`, the contract probably belongs in `packages/core`.

## Design Rules

- Keep exports domain-specific and explicit.
- Keep helpers deterministic and side-effect free.
- Favor transport-safe primitives at the package boundary.
- Prefer a formatter or option builder over separate label schemas.
- Prefer names like `formatX`, `normalizeX`, `getXBase` over vague generic helper function names.
- Prefer SCREAMING_SNAKE_CASE for shared constant values and PascalCase for shared enums.
- Zod schemas should be named like `const ObjectSchema` and inferred types should be named like `type ObjectType = z.infer<typeof ObjectSchema>`.
- For input and output shapes that are shared between API and frontend, prefer naming them like `ObjectCreateInputSchema` and `ObjectUpdateNameInputSchema` to clarify their transport role.
- Keep each domain isolated under its own subpath.

## When To Extract Into Core

Move logic into `packages/core` when:

- the same domain shape is needed by both `packages/api` and `apps/web`
- `packages/auth` and `packages/api` share the same normalization or validation rule
- a shared enum, default, or format should drive frontend behavior automatically

Keep logic local when it is truly slice-specific, UI-only, router-only, or persistence-only.

## Introducing A New Shared Enum Or Contract

When you add a new shared category, status, or contract:

1. Add or update the schema in `packages/core/src/<domain>/types.ts`.
2. Update any derived helpers in `packages/core/src/<domain>/utils.ts`.
3. Make `apps/web` consume the shared schema, defaults, and options instead of duplicating literals.
4. Make `packages/api` consume the shared contract instead of redefining parallel schemas.
5. Update persisted enums in `packages/db` and generate a migration if the value is stored in the database.

This is the default repo behavior unless the task explicitly asks for package-local divergence.
