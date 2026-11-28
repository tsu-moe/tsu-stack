# Upstream sync

## 2026-11-28

- Upstream [tsu-moe/tsu-stack](https://github.com/tsu-moe/tsu-stack.git), branch `main` at `6077ee8a24b2662c2020ab1b9c4271cd7fd3d895`.
- Starting commit `ab8f04aef3dd8eaa10e1a8754e0b5a0fec6f6803`. Git reported `310ee7e268dcec78d14787f21d8ee06d8ee47949` as the common ancestor.
- Adopted the public site refresh, localized routing, and Playwright scaffold checks.
- Kept the merged Nitro app, packaged PostgreSQL migrations, and client-IP normalization. Liveness skips session lookup; protected requests still receive normalized headers. The standalone server startup remains excluded.
- Frozen install, workspace checks, unit tests, and the production build passed. The seven production Playwright tests passed against disposable PostgreSQL, including the packaged migration check.
- Recorded in the `chore: merge main` merge commit.

## Mobile performance on 2026-11-28

- Upstream [tsu-moe/tsu-stack](https://github.com/tsu-moe/tsu-stack.git), branch `main` at `103e0c76ce6d143c405c62a22c519d6f9801a90b`.
- Starting commit `c8da9f638fd15b006fe79591f6e809cbea77a2f7`. Git reported `6077ee8a24b2662c2020ab1b9c4271cd7fd3d895` as the common ancestor.
- Adopted responsive dashboard previews, deferred WebGL and account-menu loading, lightweight toast animations, and auth return-path verification.
- Kept the merged Nitro runtime and packaged PostgreSQL migrations.
- Workspace checks, unit tests, and production build passed. Eight production Playwright tests passed against disposable PostgreSQL.
- Recorded in the `chore: merge main` merge commit.
