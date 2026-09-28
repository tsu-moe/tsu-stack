# TypeScript Conventions

Use this for repo-wide TypeScript structure, import boundaries, and schema placement.

For shared cross-package domain contracts in `packages/core`, follow [Core package patterns](./core.md).

## Prefer Inference From the Source

Derive types from the schema or API that defines the data, such as a Drizzle schema, a validation schema, or a function return type. Keep types close to their source instead of maintaining duplicate shapes. When a type is wrong, fix the schema or function signature rather than asserting a different type at the point of use.

Validate data at boundaries where TypeScript cannot establish its runtime shape, such as user input and external responses. A type assertion does not validate data.

## Use TypeScript's Checks Intentionally

- Avoid `as` when it only silences a type error. Use it when a boundary or library contract cannot express a fact already established by the code, and keep the assertion close to that evidence.
- Use `satisfies` when a value should be checked against a contract while retaining its inferred type, especially for configuration objects.
- Let TypeScript infer generic arguments when it can. Supply them when the type cannot be inferred from the arguments or when an API requires the caller to define it, such as a route context type.

Prefer simple types that describe the current behavior. Introduce custom generic utilities only when they solve a concrete need.

## Shared Schema Pattern

For shared package domains, prefer a small domain module over ad hoc type dumping grounds.

```text
src/<domain>/
	constants.ts
	types.ts
	utils.ts
	index.ts
```

For app-local or slice-local code, keep schemas next to the owning route, feature, or package instead of creating a global type folder.

## Validation And Placement

- Parse untrusted data into a specific domain type at the earliest, nearest I/O boundary. Use the owner's existing validator, or Zod when none exists.
- Keep one-off schemas inline. Extract only for reuse, colocated with the narrowest common owner; FSD contracts start in `types/index.ts` and split into descriptive `*.type.ts` files only as needed.
- Call `parse`, `safeParse`, or equivalent directly. Add a parser helper only for decoding, normalization, recovery, composition, or domain-error mapping.
- Reserve `*.schema.ts` for database tables. Avoid loose application contracts such as `Record<string, unknown>`, `object`, and `unknown`.
- Move cross-package contracts into `packages/core` instead of duplicating them.

Example package-local schema:

```ts
export const ThingSchema = z.object({ ... });
export type Thing = z.infer<typeof ThingSchema>;
```

Both schema (`ThingSchema`) and type (`Thing`) are named exports.

When a schema is shared across package boundaries, export the schema and inferred type from the owning shared module and import that same schema everywhere else.

If the frontend needs labels, options, or defaults for a shared enum, derive them from the shared schema or shared helpers instead of creating a second local union.

## Module Resolution

- `nodenext` module resolution with `allowImportingTsExtensions`
- Cross-package: `@tsu-stack/<package>/<subpath>`
- Intra-package: `#@/` alias

## `lib/` vs `utils/`

| Directory | Contains                                          |
| --------- | ------------------------------------------------- |
| `lib/`    | Business logic, library integrations, API clients |
| `utils/`  | Pure stateless helper functions                   |

In `packages/core`, keep shared schemas in domain `types.ts` files and pure domain helpers in `utils.ts`. Do not move router, DB, or React logic there.

## Linting (Oxlint)

Inline disable syntax:

```ts
// oxlint-disable-next-line no-console
console.log("debug");

// oxlint-disable-line no-console, no-plusplus
console.log(x++);

/* oxlint-disable no-console */
// Disables for rest of file
```

ESLint-style comments (`eslint-disable-*`) also work for compatibility.

## Checking Changes

Use `vp run -w check` for repo-wide TypeScript validation. It runs Oxlint with type-aware linting and type checking. Do not run `tsc --noEmit` separately; it is unnecessary. See [Workflow](./workflow.md) for the full validation guidance.

## Import Sorting (auto-enforced by Oxfmt)

Order: builtins → external → `@tsu-stack/*` → `@/pages` → `@/widgets` → `@/features` → `@/entities` → `@/shared` → relative → styles
