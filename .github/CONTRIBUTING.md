# **Contributing**

When contributing to this repository, please first discuss the change you wish to make via issue,
email, Discord, or any other method with the owners of this repository before making a change.

## Commit Conventions

We use a simplified version of [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

- this also applies to PRs

## Scaffolding CLI

Changes to `tools/create-tsu-stack` must preserve prompt/flag parity, immutable source resolution, staging-directory safety, and the allowlisted identity-transformation contract. Run:

```bash
cd tools/create-tsu-stack
vp check --fix
vp test
vp run pack:check
```

See [`.agents/cli.md`](../.agents/cli.md) for template compatibility, smoke coverage, adding variants, first-publication bootstrap, trusted-publisher configuration, and release recovery.

Maintainers release the package from a clean, current `main` with `vp run release [version]`. This validates the package, creates a release commit and annotated tag, then atomically pushes explicit `origin` refs; it does not require a branch upstream. A failed final push can be fixed and resumed by rerunning the command. The command changes Git and remote state, so it must not be used as local validation. The tag workflow publishes through npm trusted publishing; contributors and Renovate branches never publish packages or create release tags.

## Pull Request Process

1. Your Pull Request will be merged to the preview environment by the maintainers once it's approved after review.
2. Your changes won't reflect on the main website until enough testers have confirmed the preview environment to be stable and usable and when the maintainers create a new release in the private repository.

## Issue Report Process

1. Go to the project's issues.
2. Select the template that better fits your issue.
3. Read the instructions carefully and write within the template guidelines.
4. Create a reproduction repository, if necessary.
5. Submit it and wait for support.
