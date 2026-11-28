# Upstream sync

## 2026-11-28

- Upstream [tsu-moe/tsu-stack](https://github.com/tsu-moe/tsu-stack.git), branch `main` at `6077ee8a24b2662c2020ab1b9c4271cd7fd3d895`.
- Starting commit `26c429200254fdcb2a3c22f5fbb55a45a187699f`. Git reported `310ee7e268dcec78d14787f21d8ee06d8ee47949` as the common ancestor.
- Adopted the public site refresh, localized routing, liveness change, and Playwright scaffold checks.
- Kept the Worker build, D1 binding and migration history, request-scoped auth, and client-IP normalization. Used the browser's `appendChild` method for the WebGL canvas to avoid a collision with Cloudflare's HTMLRewriter types. Nitro and the standalone server startup remain excluded.
- Frozen lockfile validation, workspace checks, unit tests, and production build passed. Six production Playwright tests passed against disposable local D1.
- Recorded in the `chore: merge main` merge commit.

## Mobile performance on 2026-11-28

- Upstream [tsu-moe/tsu-stack](https://github.com/tsu-moe/tsu-stack.git), branch `main` at `103e0c76ce6d143c405c62a22c519d6f9801a90b`.
- Starting commit `053cab79baa1d03f6aa431cb1276ac3f49ae9ca0`. Git reported `6077ee8a24b2662c2020ab1b9c4271cd7fd3d895` as the common ancestor.
- Adopted responsive dashboard previews, deferred WebGL and account-menu loading, lightweight toast animations, and auth return-path verification.
- Kept the D1 Worker runtime, binding, and WebGL DOM compatibility.
- Workspace checks, unit tests, and production build passed. Seven production Playwright tests passed against disposable local D1.
- Recorded in the `chore: merge main` merge commit.
