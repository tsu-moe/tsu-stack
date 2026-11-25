# oRPC procedures and errors

Use the shared procedure factories. Choose `publicProcedure` for public reads, `protectedProcedure` for normal authenticated work, and [fresh protection](auth.md#sessions-and-guards) when revocation must take effect immediately.

- Add OpenAPI metadata with `.meta(openapi({ method, description }))` using `openapi` from `@orpc/openapi`. Declare the Zod input when the operation accepts input, plus an explicit output schema. See the [health router](../packages/api/src/routers/health/index.ts).
- Keep the slice router in `routers/<slice>/index.ts`, with names such as `byId`, `search`, `edit`, and `remove`. Keep DB access nearby. Extract reusable slice helpers into sibling files and use API `lib/` for real cross-router infrastructure.
- Source shared schemas from [Core](core.md). Keep transport-only shapes with the router. Return repo-native fields where possible and convert server-only values at the edge.

## Errors and outcomes

Define expected errors with `.errors({ ... })` and throw `errors.MY_ERROR()`. Use a typed `data` schema for safe fields the client needs. Use raw `ORPCError` for framework glue or interoperability. Let the shared boundary handle unexpected exceptions.

At the client, narrow with `isDefinedError` from `@orpc/client`, switch on `error.code`, and read `error.data` only where defined. Map errors to safe user-facing copy and use a generic fallback for unexpected failures. Keep wrapper code in the [owning slice](api-fetching-patterns.md).

Use `context.logger` and let middleware emit. Attach useful outcome context with the [logging conventions](logging.md), including audit records for accountability-relevant actions. Test through [direct procedure calls](orpc-testing.md) unless transport is what matters.
