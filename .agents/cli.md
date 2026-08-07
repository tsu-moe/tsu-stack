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

The `cloudflare-d1` hook owns Wrangler authentication, remote D1 creation, binding updates, and migrations. Remote resource creation occurs only when the user explicitly selects `--setup cloudflare`, after project files and dependencies are ready. `--setup local` applies the local D1 migrations without requiring Docker. If provisioning partially fails, preserve the generated project and report the database name/ID plus the recovery command.

This guide is for maintainers of the generator. The transformation must remove `.agents/cli.md` from generated projects, along with `tools/create-tsu-stack`; the remaining `.agents` files continue to document application development.

## Release

`vp run release [version]` performs a clean/current-`main` preflight, validates the CLI, then uses `bumpp` to create `release: vX.Y.Z`, tag `vX.Y.Z`, and push. Do not run it from feature branches. It changes Git and remote state.

The tag workflow verifies package/tag parity and main ancestry, rebuilds and retests, publishes stable versions under `latest` and prereleases under `next`, then creates the GitHub release. Publication and release creation are rerun-safe.

For the first release only:

1. Recheck that `create-tsu-stack` is unclaimed on npm.
2. Build and validate the exact package, then perform an owner-authenticated `npm publish --access public` from `tools/create-tsu-stack`.
3. Configure npm trusted publishing for `tsu-moe/tsu-stack`, workflow `.github/workflows/release.yml`, and the protected `npm` environment if enabled.
4. Test the tag workflow, then restrict or revoke token-based publishing.

The release job intentionally has no package-manager cache and uses `contents: write` plus `id-token: write` for npm OIDC. Never add a long-lived npm token.

If npm publication succeeds but GitHub release creation fails, rerun the tag workflow. It detects the published version and retries only the missing release. If publication fails, fix the trusted-publisher/environment configuration and rerun the same tag; do not create a replacement version unless the package contents must change.
