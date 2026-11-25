# Human decisions

Use this when a required decision cannot be inferred from the task or repository.

1. Use the runtime’s native approval UI for permissions, escalation, or destructive operations.
2. Use available structured input for meaningful choices. Prefer enums and allow custom text where valid. Name concrete commands if they exist.
3. If neither is available, offer numbered options in chat and identify the recommended option and any valid custom response.

## Approval scope

Before migrating or pushing schema to an existing database, mutating remote infrastructure, deploying, or releasing, name the exact command, verified target, and expected side effects. Use a credential-free target description such as the database host, port and name, the Cloudflare account and Worker or D1 binding, or the release version and destination.

Proceed when the user's request explicitly covers that action and target or the user approves the proposed operation. Otherwise wait. Ask again if the target or side effects change. Treat authorization to push code as scoped to that push. Credentials, a logged-in CLI, and tool execution permissions only indicate capability.

If the effective target is unclear, stop before the operation and resolve it with the user. See [Database](database.md) and [Workflow](workflow.md).
