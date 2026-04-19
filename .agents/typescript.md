# TypeScript Conventions

## Zod Schema Pattern

Place schemas in `types/thing.type.ts`:

```ts
export const ThingSchema = z.object({ ... });
export type Thing = z.infer<typeof ThingSchema>;
```

Both schema (`ThingSchema`) and type (`Thing`) are named exports.

## Module Resolution

- `nodenext` module resolution with `allowImportingTsExtensions`
- Cross-package: `@tsu-stack/<package>/<subpath>`
- Intra-package: `#@/` alias

## `lib/` vs `utils/`

| Directory | Contains                                          |
| --------- | ------------------------------------------------- |
| `lib/`    | Business logic, library integrations, API clients |
| `utils/`  | Pure stateless helper functions                   |

## oRPC Procedures

- `publicProcedure` — base, typed context `{ session, logger }`
- `protectedProcedure` — adds auth middleware + OpenAPI `security` metadata
- Routers are plain objects composed into `appRouter`
- OpenAPI metadata via `.route({ method, description })` and `.spec()` callbacks

## Logging

Logger uses hierarchical categories: `["tsu-stack", "server"]`, `["tsu-stack", "web", "client"]`, etc.

### Function debugging pattern

```ts
const childLogger = logger.with({ fn: "migrateDatabase" });
childLogger.info("[{fn}] Starting migration");
childLogger.info("[{fn}] Skipping: ({env})", { env: ENV_SERVER.NODE_ENV });
```

Use `{*}` to log all variables passed to the logger instance.

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
