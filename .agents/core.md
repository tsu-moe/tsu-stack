# Core domain contracts

Use `packages/core` for pure domain logic and contracts intended to drive more than one package. API, database, and UI should import the same shared schemas, types, literals, and defaults. Keep React, procedures, DB access, environment, storage, logging, and network I/O with their runtime owners.

- Group per domain. Put Zod schemas, inferred types, and contract defaults in `types.ts`, support constants in `constants.ts`, and pure normalizers, formatters, or option builders in `utils.ts`. Export the public surface through the domain’s `index.ts` and package subpath.
- Name schemas `ThingSchema`, types `Thing`, and shared constants `SCREAMING_SNAKE_CASE`. Name input/output schemas for their role, such as `ThingCreateInputSchema`. Prefer transport-safe primitives.
- Change a shared enum or filter once. Use it for oRPC validation, web route validation, and UI options or defaults. Update the persisted contract and [migration](database.md) when the database stores the value. Keep local-only behavior in its own slice.

See the [health domain](../packages/core/src/health/index.ts) and [TypeScript](typescript.md).
