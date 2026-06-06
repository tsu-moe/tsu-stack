# Choice Flows And Human Decisions

Use this guidance whenever the next step depends on a human choice, approval, denial, or custom instruction. Repository docs can steer behavior, but the actual UI depends on runtime and tool support.

## Choice Flows And Native Human Input

When a human decision is required, agents must use the most structured interaction mechanism available in the current runtime.

Priority order:

1. **Native approval UI**
   Use this for approve/deny decisions about generated commands, sandbox escalation, destructive actions, network access, permission requests, or policy/rule approvals.

   Examples:
   - command approval
   - sandbox escalation approval
   - request-permissions approval
   - rule-triggered approval

2. **MCP elicitation or equivalent structured input**
   Use this for predefined choices, enum selections, forms, or custom text input when the runtime exposes an MCP elicitation or equivalent structured-input tool.

   Use this instead of a plain text list when the user needs to choose from options such as:
   - run full validation
   - skip validation
   - run a lighter alternative
   - provide custom instructions

3. **Plain numbered text fallback**
   Use a numbered text menu only when no native approval UI, request-permissions tool, MCP elicitation tool, or equivalent structured-input mechanism is available.

Agents must not silently downgrade to text menus if a native mechanism is available. Agents must not describe a text menu as a native UI choice flow or claim they used a choice UI when they only printed a text list.

## Native UI Requirements

Before presenting a human decision as plain text, check whether the runtime exposes a dedicated mechanism for the decision:

- For approve/deny of a command or permission-sensitive action, use the runtime's approval/request-permissions mechanism.
- For a predefined selection or form-style input, use MCP elicitation or the runtime's equivalent structured-input tool.
- Only if no such mechanism exists, present a plain text fallback.
- If using MCP elicitation, request a structured field instead of free prose. Prefer an enum field for predefined choices and include a separate free-text field only when custom input is allowed.
- Include an `Other`/custom option whenever free-form user input may be valid.
- If no equivalent repository command exists, say so in the option text and use a placeholder-free non-command choice instead.
- Do not continue past the decision point until the user selects an option or provides custom instructions.
- If the user's custom instruction is unsafe, destructive, out of scope, or conflicts with repository policy, explain the issue and ask for a safer alternative.

No repository-specific MCP elicitation helper, wrapper script, or choice-flow command exists in this repo. Use a concrete runtime tool only when the current agent environment exposes one.

## Conceptual MCP Elicitation Shape

This example is conceptual unless the current runtime exposes an MCP elicitation or equivalent structured-input tool:

```json
{
  "method": "elicitation/create",
  "params": {
    "message": "Validation is optional for this documentation-only change. Choose how to proceed.",
    "requestedSchema": {
      "type": "object",
      "properties": {
        "choice": {
          "type": "string",
          "enum": [
            "run_full_check",
            "skip_validation",
            "review_markdown_only",
            "custom"
          ],
          "description": "How should the agent proceed?"
        },
        "customInstructions": {
          "type": "string",
          "description": "Optional custom instructions when choice is custom."
        }
      },
      "required": ["choice"]
    }
  }
}
```

## Codex-Specific Behavior

For Codex, use native approval prompts for command approval, sandbox escalation, request-permissions prompts, and rule-triggered approvals when available in the current configuration.

For multi-option choice flows that are not simple approve/deny decisions, prefer MCP elicitation or another structured-input tool if the Codex environment exposes one.

If the current Codex runtime does not expose a structured choice/input tool to the agent, state that no native choice UI is available and use the plain text fallback. Do not pretend the fallback is the dedicated UI.

## Common Repository Choices

Docs-only change:

Use the runtime's structured-input mechanism if available.

Preferred structured choices:

- `run_full_check`: run `vp check`
- `skip_validation`: skip validation
- `review_markdown_only`: review the changed markdown only; no lighter docs-only validation command exists
- `custom`: wait for custom instructions

Plain text fallback only:

```text
Decision required: this is a markdown-only documentation change, and validation is optional.

Options:
1. Run the general repo check: `vp check`
2. Skip validation
3. No lighter docs-only validation command exists; review the changed markdown only
4. Other: provide custom instructions

Reply with 1, 2, 3, 4, or custom text.
```

Tests:

Use the runtime's structured-input mechanism if available.

Preferred structured choices:

- `run_unit_tests`: run `vp run test:unit:run`
- `skip_tests`: skip tests
- `run_package_unit_tests`: run `vp test` from the touched package, when available
- `custom`: wait for custom instructions

Plain text fallback only:

```text
Decision required: changes may require tests.

Options:
1. Run the repo unit test wrapper: `vp run test:unit:run`
2. Skip tests
3. Run a narrower package-local unit test command, when available: `vp test` from the touched package
4. Other: provide custom instructions

Reply with 1, 2, 3, 4, or custom text.
```

Formatting or lint fixes:

Use native command approval if the runtime requires approval for the command. For the choice between fix, skip, preview, or custom instructions, use structured input if available.

Preferred structured choices:

- `run_fix`: run `vp run fix`
- `skip_fixes`: skip formatting/fixes
- `show_command`: show `vp run fix` without running it
- `custom`: wait for custom instructions

Plain text fallback only:

```text
Decision required: formatting or lint fixes are available.

Options:
1. Run the root fix script: `vp run fix`
2. Skip formatting/fixes
3. Show the proposed formatting/fix command without running it
4. Other: provide custom instructions

Reply with 1, 2, 3, 4, or custom text.
```

Validation after code changes:

Use the runtime's structured-input mechanism if available.

Preferred structured choices:

- `run_package_check`: run `vp check` in the touched app or package
- `skip_validation`: skip validation
- `run_fix`: run `vp run fix` so the agent can clean up auto-fixable issues
- `custom`: wait for custom instructions

Plain text fallback only:

```text
Decision required: code changed, and validation is optional until approved.

Options:
1. Run the narrowest relevant package check: `vp check`
2. Skip validation
3. Run the root fix script so the agent can clean up auto-fixable issues: `vp run fix`
4. Other: provide custom instructions

Reply with 1, 2, 3, 4, or custom text.
```

End-to-end tests:

Use the runtime's structured-input mechanism if available.

Preferred structured choices:

- `run_e2e_tests`: run `vp run test:e2e:run`
- `skip_e2e_tests`: skip e2e tests
- `run_unit_tests`: run `vp run test:unit:run`
- `custom`: wait for custom instructions

Plain text fallback only:

```text
Decision required: changes may require end-to-end tests.

Options:
1. Run the repo e2e test wrapper: `vp run test:e2e:run`
2. Skip e2e tests
3. Run unit tests instead: `vp run test:unit:run`
4. Other: provide custom instructions

Reply with 1, 2, 3, 4, or custom text.
```
