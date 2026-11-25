# Human decisions

Use this when a required decision cannot be inferred from the task or repository.

1. Use the runtime’s native approval UI for permissions, escalation, or destructive operations.
2. Use available structured input for meaningful choices. Prefer enums and allow custom text where valid. Name concrete commands if they exist.
3. If neither is available, offer numbered options in chat and identify the recommended option and any valid custom response.

Wait for required decisions and explain unsafe or out-of-scope choices clearly. The repository provides no approval or elicitation wrapper. For validation and migration defaults, see [Workflow](workflow.md), [Testing](testing.md), and [Database](database.md).
