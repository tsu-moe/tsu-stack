---
name: sync-template
description: Compare or update a project derived from tsu-moe/tsu-stack while preserving application features, identity, configuration, and deployment behavior. Use for template syncs and upstream reviews.
---

# Sync a project with tsu-stack

Use the canonical `https://github.com/tsu-moe/tsu-stack.git`. A comparison request is inspection only. For a sync, prepare a reviewable change on a dedicated branch or isolated worktree. Publishing, pushing, opening a PR, deploying, and production migrations require separate authorization.

## Verify the base and target

- Read local `AGENTS.md`, relevant guides, scripts, env schema, and any `docs/upstream-sync.md`. Record branch, starting SHA, staged, unstaged, and untracked state. Protect local changes and secrets. Use a clean worktree when the current checkout is dirty unless the work depends on those changes. Identify existing merge, rebase, cherry-pick, or revert state first. Capture relevant baseline checks.
- Start with `.tsu-stack.jsonc` and read `source.commit`, `source.repository`, `source.branch`, and `variant`. If removed, inspect revisions from `git log --all --format=%H -- .tsu-stack.jsonc` until `git show <rev>:.tsu-stack.jsonc` succeeds.
- Without metadata, use a verified sync record or genuine merge base. Check for shallow history. For old or GitHub-template projects, identify the initial project commit with `git rev-list --max-parents=0 HEAD`, infer the variant from the tree, then bound the candidate upstream search by the initial commit date. Verify candidates using tree stats, diffs, and invariant files. Dates and dependency versions alone cannot prove ancestry. Ask the user to confirm if multiple candidates remain plausible.
- CLI variants map `separate` to `main`, `merged` to `variant/merged`, `cloudflare` to `variant/merged-cloudflare`, and `cloudflare-d1` to `variant/merged-cloudflare-d1`.
- Fetch the verified source branch or explicitly requested ref and pin the target SHA. Keep `origin` intact. Verify ancestry where expected and require an explicit rollback request for an older target. Label unverified remote state as cached.

## Integrate by ownership

Review `git log --oneline <base>..<target>`, `git diff --stat <base> <target>`, and `git diff --name-status -M <base> <target>`. Preserve features, routes, product copy, branding, auth providers and access rules, data, applied migration history, deployment identity, and useful project guidance. Reconcile compatible dependencies, scripts, config, and lockfiles together. Apply upstream framework, runtime, and tooling fixes at the local project’s current paths.

Use a reviewable normal merge when a true merge base exists. For unrelated histories, adapt only reviewed upstream changes. Avoid blanket copies/deletion, hard resets, unrelated-history merges, and automatic ours/theirs resolutions. Honor generated-project exclusions for generator sources, CLI guidance, release workflow, and maintainer CI. Keep immutable creation provenance intact.

## Verify and record

Check conflicts and automatically merged files for changed identity, restored demo content, duplicates, and unintended generated files. Run the project’s relevant format, lint, type, unit, browser, and build checks with disposable local services. Run `git diff --check`, `git diff --cached --check`, and `git ls-files -u`.

Append to `docs/upstream-sync.md` with the canonical URL, date, starting commit, comparison base and evidence, target ref and SHA, adopted changes, local adaptations, omissions, validation results, and prepared/committed state. Keep past entries. A recorded SHA does not imply every change was adopted. Verify the merge or integration commit before claiming committed completion.
