# Testing Policy

This document is the authoritative testing policy for contributors and AI agents in this repository.

## Core Policy

- Treat tests as part of normal validation when code changes affect behavior, contracts, bug fixes, or existing tested surfaces.
- Add or update focused tests for new behavior, changed behavior, shared contracts, and regression-prone bug fixes when the package or app has a practical test surface.
- Keep test work proportional to risk. Do not create broad, brittle, or low-signal tests for markdown-only edits, copy-only tweaks, purely mechanical formatting, or changes with no runtime behavior.
- Run the narrowest relevant test command after implementation and after the fix command from [Workflow](./workflow.md).
- Use unit tests for domain logic, contracts, utilities, and component behavior that can be tested locally.
- Use e2e tests for browser workflows, auth/routing behavior, and integration paths that unit tests cannot cover.
- Inspect nearby tests before generating new ones.
- Use Vite+ testing conventions, not standalone Vitest defaults.

## Test Commands

Canonical commands:

- `vp run test:unit:run`
- `vp run test:e2e:run`

Prefer package-local test commands when they exist and cover the touched surface. Use the repo wrappers when changes span packages or when package-local coverage is not available.

## Test Locations

Unit tests:

- `src/**/__tests__/*.test.ts`

End-to-end tests:

- `__e2e__/**/*.spec.ts`

Use `__e2e__` as the project convention for end-to-end tests.

## Vite+ / Vitest Setup Rule

When adding tests to a package or app that does not already have Vite+ testing configured:

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

## Test Design

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
