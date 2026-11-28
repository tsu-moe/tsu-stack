# Upstream sync

## 2026-11-28

- Upstream [tsu-moe/tsu-stack](https://github.com/tsu-moe/tsu-stack.git), branch `main` at `6077ee8a24b2662c2020ab1b9c4271cd7fd3d895`.
- Starting commit `0544cc0a3f237f4801b86c0e338eeb190759fec2`. Git reported `310ee7e268dcec78d14787f21d8ee06d8ee47949` as the common ancestor.
- Adopted the public site refresh, localized routing, liveness change, and Playwright scaffold checks.
- Kept the Worker build, PostgreSQL migrations, request-scoped auth, and client-IP normalization. The mobile menu becomes interactive after hydration. Nitro and the standalone server startup remain excluded.
- Frozen lockfile validation, workspace checks, unit tests, and production build passed. Six production Playwright tests passed against disposable PostgreSQL.
- Recorded in the `chore: merge main` merge commit.

## Mobile performance on 2026-11-28

- Upstream [tsu-moe/tsu-stack](https://github.com/tsu-moe/tsu-stack.git), branch `main` at `103e0c76ce6d143c405c62a22c519d6f9801a90b`.
- Starting commit `5883f1fd7f5ebf894b61bf658be1e6c8c29ffccb`. Git reported `6077ee8a24b2662c2020ab1b9c4271cd7fd3d895` as the common ancestor.
- Adopted responsive dashboard previews, deferred WebGL and account-menu loading, lightweight toast animations, and auth return-path verification.
- Kept the PostgreSQL Worker runtime and hydration-safe mobile menu.
- Workspace checks, unit tests, and production build passed. Seven production Playwright tests passed against disposable PostgreSQL.
- Recorded in the `chore: merge main` merge commit.
