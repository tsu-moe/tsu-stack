# Testing

Keep starter coverage focused on trust boundaries, input validation, and critical workflows. Add a regression when failure could expose data, bypass protection, corrupt results, or break a supported starter path. Verify routine copy, defaults, and plumbing during implementation. Inspect nearby tests and cover each risk at the smallest meaningful layer.

- Unit tests cover deterministic logic, contracts, and isolated UI. Put `<source>.test.ts` directly in the nearest `src/**/__tests__/`.
- Use [direct oRPC calls](orpc-testing.md) for procedure behavior. Use an integration test for real module interactions that a direct call cannot prove. Keep it in the owning package’s unit lane unless it needs a browser.
- Keep browser specs in `__e2e__/**/*.spec.ts`. Use [the home spec](../apps/web/__e2e__/home.spec.ts) for role-based locators, URLs relative to `baseURL`, and same-origin traffic against an isolated preview.
- Keep the home spec focused on stable public workflows such as navigation, localized routes, and the entry into authentication. Leave template copy, section order, styling, animation timings, and asset-loading details out of starter smoke coverage.

## Commands and setup

Run `vp test` in the owning package after the applicable [fix command](workflow.md). Use `vp run test:unit:run` for cross-package coverage and `vp run test:e2e:run` from the root for browser coverage. Install Chromium once from the web app with `vp exec playwright install chromium`.

When an existing test lane can prove the boundary, use it. When adding a unit lane to a package without one, configure `test.include` in that package’s `vite.config.ts` using `defineConfig` from `vite-plus` and expose `"test:unit": "vp test"`. Keep every advertised root test lane wired to at least one real task. Follow the [Vite+ test docs](https://viteplus.dev/guide/test).

## Boundaries and fixtures

- Test public contracts with small typed fixtures, using tables where they improve coverage. Cover meaningful success, invalid input, and regression cases. Mock nondeterministic or external I/O only. Avoid broad framework mocks, shared fixture frameworks, and routine snapshots.
- Routine tests use disposable local services or sanitized provider fakes. Keep real provider sandboxes in a separately invoked lane, with sandbox credentials, isolated resources, rate limits, and cleanup. Use them only for behavior local tests cannot prove. Keep secrets and personal data out of fixtures.
- For tests that need D1, apply the checked-in migrations with `vp run db:migrate:local --persist-to <new-directory>` and use the matching local binding and state. Keep routine tests isolated from remote D1.
