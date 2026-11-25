# Scaffolding CLI

`tools/create-tsu-stack` is a publishable generator. It resolves an immutable archive of a source variant and removes generator-only files from the generated project.

## Development and compatibility

- Use one `projectInputSchema` for interactive answers, flags, dry runs, transformations, and tests. Validate external data at the boundary. Keep variant logic in the registry and hooks. The [variant registry](../tools/create-tsu-stack/src/variants.ts) owns public names and source branches.
- A dry run can resolve a GitHub ref and must leave files, installs, Git, and resources alone. Treat `GITHUB_TOKEN` as optional for rate limiting. Keep it out of logs and persisted state.
- Download into temporary staging. Validate archive entry paths and reject links before extraction. Move into the destination only after transforming. Reject non-empty destinations. Preserve the generated project after post-generation failure.
- Allowlist identity changes. Add fixture assertions for new identity surfaces and preserve upstream license, attribution, URLs, and documentation links. Store the resolved commit in `.tsu-stack.jsonc` and replay with `--ref <sha>`.
- Keep package manifests and transformation inputs available in each variant. Generated projects retain runnable workspace unit and browser lanes, Playwright config and home smoke, and package test config. Strip generator sources, the CLI guide and maintainer references, the generator release workflow, maintainer smoke matrix, root release script, and inherited lockfile. Install, check, unit test, and build in generated CI. Upstream CI covers generation on three OSes and production smoke for each supported target.
- When adding a variant, validate its branch first, then add registry/schema entries, narrow hooks, transform and command-order tests, a CI smoke, and setup/recovery docs.

From the CLI package, run `vp check --fix`, `vp test`, and `vp run pack:check`. The pack check verifies the bundled executable, manifest/publication contents, and packed `--help`.

## Cloudflare D1 setup

Remote work requires explicit Cloudflare setup selection. After files and dependencies are ready, use app-local `wrangler whoami --json`, let the user select an account, and persist its ID. Support logout/login and cancel without discarding the project. Preflight DB names, require explicit reuse consent, and recheck alternatives. Keep the `DB` binding and accept Wrangler’s already-written binding on success. Retry transient remote migrations after creation, then apply local migrations with the final binding. Local-only setup applies local migrations without Docker. On partial failure report the selected account, DB name and ID, failure, and app-local recovery command.

## Release

Use `vp run release [version]` from clean, current `main` after npm bootstrap. It validates, selects the version with bumpp, checks local/remote/npm conflicts, and atomically pushes a Conventional Commit and annotated version tag to explicit `origin` refs. This changes remote state. Rerun after a push failure to resume the existing commit and tag. Earlier failures restore the version. The script verifies remote refs after ambiguous network failures.

The tag workflow verifies main ancestry and package/tag parity, rebuilds/tests, publishes stable to `latest` and prereleases to `next`, and creates the GitHub release. Rerun the same tag after publication or release failures. The workflow distinguishes registry errors from missing versions and retries only missing work.

For first publication, verify npm name availability and manually publish the validated `0.0.0` artifact under `next` with owner authentication. Configure npm trusted publishing for this repo/workflow and the protected npm environment if enabled, then restrict token publishing. Keep the release workflow cache-free, validation read-only, npm OIDC scoped to publication, and release write access scoped to release creation. See [the workflow](../.github/workflows/release.yml).
