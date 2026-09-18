---
name: sync-template
description: Compare or update a project derived from tsu-moe/tsu-stack while preserving application features, identity, configuration, and deployment behavior. Use when asked to sync tsu-stack, update the template foundation, or review upstream template changes.
---

# Sync a project with tsu-stack

Integrate relevant changes from `https://github.com/tsu-moe/tsu-stack` into the current project without replacing project-specific work.

For a comparison request, inspect and report only. For a sync request, prepare a reviewable change on a dedicated branch or isolated worktree. A sync request does not by itself authorize pushing, opening a pull request, publishing packages, deploying, or running production migrations.

## Establish local state

- Read the project `AGENTS.md`, relevant domain guidance, package scripts, environment schema, and any existing `docs/upstream-sync.md` record.
- Record the starting commit, current branch, staged and unstaged changes, and untracked files. Do not silently stash, commit, discard, or copy secret-bearing files.
- If the checkout is dirty, use an isolated worktree from the relevant committed state unless the requested update depends on uncommitted work. Preserve unrelated changes.
- Stop and identify the purpose of any existing merge, rebase, cherry-pick, or revert before changing it.
- Establish relevant baseline checks when practical so pre-existing failures are distinguishable from regressions.

## Resolve template provenance

The CLI writes `.tsu-stack.jsonc` with immutable creation provenance:

```json
{
  "source": {
    "repository": "tsu-moe/tsu-stack",
    "branch": "variant/merged-cloudflare",
    "commit": "<40-character SHA>",
    "requestedRef": "variant/merged-cloudflare"
  },
  "variant": "cloudflare"
}
```

Resolve the comparison base in this order, keeping command output compact:

1. Read `.tsu-stack.jsonc` in the working tree. Treat `source.commit` as the creation base and `source.branch` as the default upstream branch.
2. If the file was deleted, inspect its history rather than guessing:

   ```sh
   git log --all --format=%H -- .tsu-stack.jsonc
   git show <newest-revision-that-still-contains-the-file>:.tsu-stack.jsonc
   ```

   Walk revisions from newest to oldest until `git show <revision>:.tsu-stack.jsonc` succeeds. Use the recovered `source.commit`, branch, repository, and variant.

3. If no metadata revision exists, use a verified previous sync record or a real merge base. Check for shallow history before concluding that ancestry is absent.
4. For GitHub-template projects or old projects that never committed metadata, identify the initial project commit with `git rev-list --max-parents=0 HEAD`. Infer the likely variant from the generated tree, then use the initial commit timestamp only to bound a small search of the matching upstream branch. Compare compact tree/diff statistics and representative invariant files to validate the candidate.

Creation time is a search hint, not proof. If more than one branch or commit remains plausible, report each candidate, its SHA, and the evidence, then require user confirmation before applying upstream changes. Do not invent a base from dependency versions or a similar date.

The supported CLI branch mapping is:

| Variant         | Upstream branch                |
| --------------- | ------------------------------ |
| `separate`      | `main`                         |
| `merged`        | `variant/merged`               |
| `cloudflare`    | `variant/merged-cloudflare`    |
| `cloudflare-d1` | `variant/merged-cloudflare-d1` |

## Resolve the upstream target

- Use `https://github.com/tsu-moe/tsu-stack.git` as the canonical source. Do not assume a remote named `upstream` is correct and do not repoint `origin`.
- Fetch the metadata branch unless the user explicitly names another branch, tag, or commit. Resolve the fetched ref to an immutable SHA immediately; do not rely on a moving branch name.
- Verify that the base is an ancestor of the selected target when they are expected to share history. If the target is older than the base, explain that it represents a rollback and require an explicit rollback request.
- If the network or remote cannot be verified, label local revisions as cached and do not claim they are the latest upstream state.

## Classify and integrate changes

Inspect the upstream delta from the verified base to the target, including renames and deletions:

```sh
git log --oneline <BASE>..<TARGET>
git diff --stat <BASE> <TARGET>
git diff --name-status -M <BASE> <TARGET>
```

Treat ownership by intent, not directory name:

| Area                                                    | Guidance                                                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Routes, features, content, branding, and assets         | Preserve the project's behavior and custom content.                                                                             |
| Framework, routing, server boundaries, shared utilities | Integrate relevant upstream fixes at the project's current paths.                                                               |
| Auth, database, migrations, and environment contracts   | Preserve providers, access rules, data, applied migration history, and deployment identities.                                   |
| Dependencies, scripts, workspace config, and lockfiles  | Reconcile compatible changes together; retain project-specific requirements and regenerate lockfiles with the pinned toolchain. |
| UI and styles                                           | Review local changes and preserve accessibility and design decisions.                                                           |
| Instructions and documentation                          | Add useful upstream guidance without replacing project-specific instructions.                                                   |

When histories share a real merge base, use a clean dedicated branch and prepare a reviewable normal merge. When histories are unrelated, apply only reviewed changes from the upstream delta and adapt them to the generated project. Never use `--allow-unrelated-histories`, a blanket copy, `rsync --delete`, a hard reset, or automatic `ours`/`theirs` conflict resolution.

Generated projects intentionally omit template-maintainer files. Do not reintroduce `tools/create-tsu-stack`, `.agents/cli.md`, the package release workflow, or maintainer-only CI. Preserve `.tsu-stack.jsonc` as creation provenance; it should not be rewritten to pretend the project was created from the new target.

## Validate and record

- Review automatically merged files as well as conflicts; check for restored demo content, duplicate implementations, changed project identity, and unexpected generated files.
- Run the destination project's current format, lint, type, unit, browser, and build checks appropriate to the changed areas. Use disposable local services and never expose secrets or run production migrations.
- Check unresolved conflicts and whitespace:

  ```sh
  git diff --check
  git diff --cached --check
  git ls-files -u
  ```

- Update or create `docs/upstream-sync.md` with the canonical URL, target ref and SHA, date, project starting commit, comparison base and evidence, adopted changes, preserved adaptations, intentional omissions, validation results, and whether the sync is prepared or committed. Keep prior entries so omitted changes can be reconsidered later.
- A recorded target is not proof that every upstream change was adopted. Do not claim completion before the validated merge or integration commit exists.
