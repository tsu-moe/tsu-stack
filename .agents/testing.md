# Testing Policy

This document is the authoritative testing policy for contributors and AI agents in this repository.

## Core Policy

- Assume no tests unless explicitly requested.
- Never auto-add tests to feature work.
- Respect unit and e2e conventions enumerated below.
- Use Vite+ setup for new test environments.
- Do not generate, modify, suggest, or proactively add tests unless the developer explicitly asks.
- Implementation requests should return implementation only unless tests are explicitly requested.
- When asking whether to run tests, use [Choice flows](./choice-flows.md) and prefer native approval or structured input before any plain text fallback.
- Inspect nearby tests before generating new ones.
- Use Vite+ testing conventions, not standalone Vitest defaults.

## Test Commands

Canonical commands:

- `vp run test:unit:run`
- `vp run test:e2e:run`

## Test Locations

Unit tests:

- `src/**/__tests__/*.test.ts`

End-to-end tests:

- `__e2e__/**/*.spec.ts`

Use `__e2e__` as the project convention for end-to-end tests.

## Vite+ / Vitest Setup Rule

When tests are explicitly requested, and the package or app does not already have Vite+ testing configured:

1. Install and configure Vite+.
2. Add a root `vite.config.ts` in the package or app being tested.
3. Do not create `vitest.config.ts`.
4. Put Vitest config inside `vite.config.ts` using Vite+ conventions.

Default config:

```ts
import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    include: ["**/__tests__/**/*.test.ts"]
  }
});
```

Explicit rules:

- The Vitest config belongs in `vite.config.ts`.
- `vitest.config.ts` should not be used in this repository.
- Follow the Vite+ test docs as the source of truth: https://viteplus.dev/guide/test

## When Tests Are Explicitly Requested

Generate behavior-driven tests that prioritize:

- happy paths
- edge cases and fallback precedence
- pathological inputs
- regression-prone cases
- contract invariants

Prefer:

- table-driven tests
- testing public contracts over internals
- fixtures and builders to reduce duplication
- adding regression tests for bug fixes
- mirroring nearby test structure
