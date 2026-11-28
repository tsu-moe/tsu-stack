# Core domain contracts

Use `packages/core` for pure domain logic and contracts intended to drive more than one package. API, database, and UI should import the same shared schemas, types, literals, and defaults. Keep React, procedures, DB access, environment, storage, logging, and network I/O with their runtime owners.

- Name schemas `ThingSchema`, types `Thing`, and shared constants `SCREAMING_SNAKE_CASE`. Name input/output schemas for their role, such as `ThingCreateInputSchema`. Prefer transport-safe primitives.
- Change a shared enum or filter once. Use it for oRPC validation, web route validation, and UI options or defaults. Update the persisted contract and [migration](database.md) when the database stores the value.

See the [health domain](../packages/core/src/health/index.ts) for an example.
