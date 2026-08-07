# Scaffolding CLI

`tools/create-tsu-stack` is the publishable `create-tsu-stack` package. It scaffolds a project from an immutable archive of a selected repository variant and must never leave the generator inside the generated project.

## Development

- Use one `projectInputSchema` contract for prompt answers, automation flags, dry runs, transformations, and tests.
- Keep variant-specific behavior in `src/variants.ts` and post-generation hooks. Do not add variant conditionals throughout CLI orchestration.
- A dry run may resolve a GitHub ref, but it must not write files, invoke installation/setup commands, initialize Git, or provision resources.
- Download into a temporary staging directory. Validate archive paths and reject links before extraction; move into the destination only after transformation succeeds.
- Refuse non-empty destinations and preserve the generated directory after a post-generation command fails so the user can inspect and recover it.
- Never require, log, or persist `GITHUB_TOKEN`. It is an optional API rate-limit aid only.

Run package-local validation from `tools/create-tsu-stack`:

```bash
vp check --fix
vp test
vp run pack:check
```

`pack:check` builds the bundled ESM executable, runs publint, checks npm's package contents, and executes `--help` from the packed tarball.

## Template Compatibility

The variant registry maps stable CLI names to source branches:

| CLI variant   | Source branch                  |
| ------------- | ------------------------------ |
| separate      | `main`                         |
| merged        | `variant/merged`               |
| cloudflare    | `variant/merged-cloudflare`    |
| cloudflare-d1 | `variant/merged-cloudflare-d1` |

Template transformations are deliberately allowlisted. When a template adds a new project-identity location, add a fixture assertion before expanding the transformation. Preserve the tsu-stack license, attribution, source repository, documentation links, and other upstream URLs.

Generated `.tsu-stack.jsonc` records the resolved commit and a replay command. Branch heads remain the normal source, but a replay uses `--ref <sha>`.

Each supported branch must continue to provide the root package manifest and any paths touched by its applicable transformations. CI generates every variant on Ubuntu and a representative variant on Windows and macOS. The representative project is installed from a fresh lockfile and built.

## Adding a Variant

1. Finish and validate the source branch independently.
2. Add its public name and branch to the variant registry and shared schema.
3. Add narrowly scoped transformation and post-generation hooks.
4. Add transformation fixtures, command-order tests, and CI smoke coverage.
5. Document prerequisites and recovery commands.

The `cloudflare-d1` hook owns Wrangler authentication, remote D1 creation, binding updates, and migrations. Remote resource creation occurs only when the user explicitly selects `--setup cloudflare`, after project files and dependencies are ready. Before creating anything, read `wrangler whoami --json` from `apps/web`, show the available account names and IDs, and require the user to select the owner. Persist the selected `account_id` in `apps/web/wrangler.jsonc`. The account prompt must offer a Wrangler logout/login flow and cancellation that preserves the generated project. `--setup local` applies the local D1 migrations without requiring Docker. If provisioning partially fails, preserve the generated project and report the account, database name/ID, and recovery command.

This guide is for maintainers of the generator. The transformation must remove `.agents/cli.md` from generated projects, along with `tools/create-tsu-stack`; the remaining `.agents` files continue to document application development. Generated projects must not inherit the package release workflow, generator smoke matrix, or root release script. Replace them with the application-only CI workflow that installs, prepares the local environment, checks, and builds the generated workspace.

## Release

`vp run release [version]` performs a clean/current-`main` preflight, confirms that the package has completed its one-time npm bootstrap, and validates the CLI. `bumpp` selects and writes the version without committing or pushing; the release script then checks that the tag is unused locally, remotely, and on npm. Finally, it creates `chore(release): vX.Y.Z`, creates an annotated `vX.Y.Z` tag, and atomically pushes explicit `origin` branch and tag refs. This does not depend on a configured upstream branch. Do not run it from feature branches. It changes Git and remote state.

If the final push fails, rerun the same command after fixing access or branch-protection settings. A clean local release commit whose tag points to `HEAD` is recognized and resumed, so the version is not bumped twice. The script also verifies the remote refs after an ambiguous network failure. Failures before the commit restore the package version; a failure after the commit and tag preserves both for recovery.

The tag workflow verifies package/tag parity and main ancestry, rebuilds and retests, publishes stable versions under `latest` and prereleases under `next`, then creates the GitHub release. Publication and release creation are rerun-safe.

For the first release only:

1. Recheck that `create-tsu-stack` is unclaimed on npm.
2. Build and validate the exact `0.0.0` package, then perform an owner-authenticated `npm publish --access public --tag next` from `tools/create-tsu-stack`. This claims the package without assigning the bootstrap build to `latest`.
3. Configure npm trusted publishing for `tsu-moe/tsu-stack`, workflow `.github/workflows/release.yml`, and the protected `npm` environment if enabled. Allow the `npm publish` action in npm's trusted-publisher settings.
4. Test the tag workflow, then restrict or revoke token-based publishing.

Until these bootstrap steps are complete, the release command stops before changing the version or Git history. The tag workflow has a matching guard in case a tag is created manually.

The release workflow intentionally has no package-manager cache. Validation receives read-only repository access, npm publication receives only `contents: read` and `id-token: write`, and GitHub release creation receives `contents: write` without an OIDC token. Never add a long-lived npm token.

If npm publication succeeds but GitHub release creation fails, rerun the tag workflow. It distinguishes an npm 404 from registry/network failures, verifies the published version after publication, detects existing npm and GitHub releases, and retries only the missing work. If publication fails, fix the trusted-publisher/environment configuration and rerun the same tag; do not create a replacement version unless the package contents must change.
