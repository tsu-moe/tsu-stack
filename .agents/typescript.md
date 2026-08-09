# TypeScript Conventions

Use this for repo-wide TypeScript structure, import boundaries, and schema placement.

For shared cross-package domain contracts in `packages/core`, follow [Core package patterns](./core.md).

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

## Schema Placement

- Keep schemas close to the owning slice or package.
- In a Feature-Sliced Design slice, create a `types/` segment with `types/index.ts` by default. Keep the slice's Zod schemas and inferred TypeScript types together in that file.
- Split `types/index.ts` only after the segment becomes meaningfully complex or contains several independent contracts. Move those contracts into descriptive files such as `sign-up/types/user.type.ts` or `sign-up/types/button-props.type.ts`, then re-export them from `types/index.ts`.
- Do not create one-file-per-type modules preemptively. Types used only as private implementation details in one component may remain colocated with that component.
- Outside FSD slices, keep app-local or package-local schema modules close to their owner and use descriptive `*.type.ts` filenames when a dedicated file is warranted.
- When the same schema, enum, or default is consumed across packages, move it into `packages/core` instead of recreating literal unions in `apps/web` or `packages/api`.

Example package-local schema:

```ts
export const ThingSchema = z.object({ ... });
export type Thing = z.infer<typeof ThingSchema>;
```

Both schema (`ThingSchema`) and type (`Thing`) are named exports.

When a schema is shared across package boundaries, export the schema and inferred type from the owning shared module and import that same schema everywhere else.

If the frontend needs labels, options, or defaults for a shared enum, derive them from the shared schema or shared helpers instead of creating a second local union.

## Validation Schema Conventions

- Prefer the app or package's existing validation library. When none exists, use Zod or another established validation library rather than loose structural assertions.
- In FSD, keep Zod or equivalent runtime validation schemas in the owning slice's `types/index.ts` by default; use descriptive `*.type.ts` files only when that segment needs to be split. Reserve `*.schema.ts` for Drizzle/PostgreSQL table schemas, such as `auth.schema.ts`; do not use `codec` names for ordinary validation schemas.
- Export the schema as a named `PascalCaseSchema` value and derive its TypeScript type from that schema.
- Call the validation library's `parse`, `safeParse`, or equivalent method directly at the use site. Do not wrap a single validator method in a `parseThing` utility.
- Create a parser helper only when it owns additional boundary behavior such as decoding raw text, composing multiple schemas, normalizing data, applying fallback or recovery behavior, or mapping failures to domain-specific errors.
- Do not use `Record<string, unknown>`, `object`, `unknown`, or equivalent loose types as application contracts when a specific validated schema can be defined. Keep unavoidable untrusted values at the boundary and validate them immediately.

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

## Import Sorting (auto-enforced by Oxfmt)

Order: builtins → external → `@tsu-stack/*` → `@/pages` → `@/widgets` → `@/features` → `@/entities` → `@/shared` → relative → styles
