# Choice Flows And Human Decisions

Use this when the next step depends on a human decision, approval, denial, or custom instruction. Repository docs define defaults; choice flows are for decisions the repo cannot infer safely.

## Priority

1. Use native approval UI for approve/deny decisions such as command approval, sandbox escalation, network access, destructive actions, and permission requests.
2. Use MCP elicitation or equivalent structured input for predefined choices, enum selections, forms, or custom text.
3. Use a numbered plain-text menu only when no native or structured mechanism is available.

Do not describe a plain-text menu as a native UI flow. Do not continue past a required decision until the user chooses an option or gives custom instructions.

## Structured Input Rules

- Prefer enum fields for predefined choices.
- Include a free-text custom field when custom instructions are valid.
- Include an `Other`/custom option whenever free-form input may be valid.
- If no equivalent repo command exists, say so in the option text instead of inventing a placeholder command.
- If custom instructions are unsafe, destructive, out of scope, or conflict with repo policy, explain the issue and ask for a safer alternative.

No repository-specific MCP elicitation helper or wrapper command exists here. Use a concrete runtime tool only when the current environment exposes one.

## Common Decisions

Validation scope for broad changes:

- Package-local fix: `vp check --fix` from each touched package/app.
- Workspace fix: `vp run -w fix`.
- Unit tests: run the narrowest relevant unit test command.
- E2E tests: run the relevant e2e command for browser workflows.
- Custom: wait for custom instructions.

Fix command scope:

- Package-local: `vp check --fix`.
- Workspace-level: `vp run -w fix`.
- Custom: wait for custom instructions.

Test scope:

- Package-local unit tests when available.
- Repo unit wrapper: `vp run test:unit:run`.
- Repo e2e wrapper: `vp run test:e2e:run`.
- Custom: wait for custom instructions.

Migration or generated artifact handling:

- Run the generation command named by the owning doc.
- Run the apply/migrate command after required safety checks.
- Inspect generated output before applying state changes.
- Custom: wait for custom instructions.

Plain-text fallback format:

```text
Decision required: <short reason>.

Options:
1. <recommended concrete option>
2. <next concrete option>
3. Other: provide custom instructions

Reply with 1, 2, 3, or custom text.
```
