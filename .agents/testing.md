# Testing Policy

This document is the authoritative testing policy for contributors and AI agents in this repository.

## Core Policy

- Treat tests as part of normal validation when code changes affect behavior, contracts, bug fixes, or existing tested surfaces.
- Add or update focused tests for new behavior, changed behavior, shared contracts, and regression-prone bug fixes when the package or app has a practical test surface.
- Keep test work proportional to risk. Do not create broad, brittle, or low-signal tests for markdown-only edits, copy-only tweaks, purely mechanical formatting, or changes with no runtime behavior.
- Run the narrowest relevant test command after implementation and after the fix command from [Workflow](./workflow.md).
- Inspect nearby tests before generating new ones.
- Use Vite+ testing conventions, not standalone Vitest defaults.

## Choose the Test Layer

Use the smallest layer that proves repository-owned behavior:

- **Unit:** deterministic domain logic, contracts, utilities, and isolated component behavior.
- **oRPC procedure:** middleware, authorization, validation, handler output, and typed errors. Follow [oRPC testing](./orpc-testing.md).
- **Integration:** interaction between owned modules or a real local boundary when a unit or direct procedure test cannot prove it. Keep it in the owning package's unit lane unless it requires a browser.
- **E2E:** public browser workflows, routing, rendering, and integration paths that only a running application can prove.

Do not duplicate the same assertion across layers without a distinct risk. TanStack Query and oRPC client wrappers need focused tests only when they add owned behavior such as key construction, invalidation, or error mapping.

## Test Commands

Canonical commands:

- `vp run test:unit:run`
- `vp run test:e2e:run`

Prefer package-local test commands when they exist and cover the touched surface. Use the repo wrappers when changes span packages or when package-local coverage is not available.

Package-local defaults:

- Unit: `vp test`
- E2E: `vp exec playwright test`

Every root test lane advertised by the repository or generated-project CI must select at least one workspace task. Do not hide an empty lane with `--pass-with-no-tests` or an equivalent fallback.

## Test Locations

Unit tests:

- `src/**/__tests__/*.test.ts`
- Name the test after the source basename: `src/example.ts` → `src/__tests__/example.test.ts`.
- Keep test files directly inside `__tests__`; do not add another directory below it.

End-to-end tests:

- `__e2e__/**/*.spec.ts`
- Name specs after the user-visible surface or workflow, for example `__e2e__/home.spec.ts`.

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
    include: ["src/**/__tests__/*.test.ts"]
  }
});
```

Explicit rules:

- The Vitest config belongs in `vite.config.ts`.
- `vitest.config.ts` should not be used in this repository.
- Add `"test:unit": "vp test"` to the owning workspace package so the root unit lane discovers it.
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
- small, test-local typed fixtures and builders
- adding regression tests for bug fixes
- mirroring nearby test structure

Avoid by default:

- snapshots and repository-wide coverage targets
- broad framework, router, auth, or oRPC mocks
- remote services, shared development databases, and pre-existing dev servers
- shared fixture frameworks before repeated, stable reuse justifies one

Mock only nondeterministic or external I/O boundaries that the test does not own, such as a database adapter, clock, or third-party provider. Prefer local deterministic dependencies when their real behavior is part of the test.
