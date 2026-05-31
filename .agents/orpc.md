# oRPC Patterns

Use this when adding or refactoring oRPC procedures, routers, or client integration in this repo.

This guide is intentionally repo-specific. It documents the current preferred way to build oRPC routes here and should stay aligned with:

- [Logging patterns](./logging.md)
- [API fetching patterns](./api-fetching-patterns.md)

## Goals

- Keep server procedure definitions explicit and typed.
- Keep router handlers small, predictable, and easy to scan.
- When logging is explicitly needed, use request-scoped, outcome-oriented logging without duplicating middleware or global error logs.
- Prefer type-safe oRPC errors from procedure definition through client handling.
- Keep TanStack Query wrapper structure in [API fetching patterns](./api-fetching-patterns.md), not in this file.

## Server Route Shape

Define routes with the shared procedure factories from `packages/api/src/lib/procedures/factory.ts`.

- Use `publicProcedure` for public read operations.
- Use `protectedProcedure` for authenticated operations.
- Add route metadata with `.route({ description, method })`.
- Define `input(...)` and `output(...)` schemas explicitly with Zod.
- Prefer returning repo-native shapes directly instead of renaming fields unless there is a strong product reason.

Typical shape:

```ts
const exampleInputSchema = z.object({
  id: z.string().min(1)
});

const exampleOutputSchema = z.object({
  id: z.string(),
  name: z.string()
});

export const exampleRouter = {
  byId: publicProcedure
    .route({
      description: "Get an example by ID",
      method: "GET"
    })
    .input(exampleInputSchema)
    .output(exampleOutputSchema.nullable())
    .handler(async ({ input, context, errors }) => {
      // ...
    })
};
```

## Errors

Prefer type-safe oRPC errors with `.errors(...)` on the procedure base.

- Define expected errors up front.
- Use `errors.MY_ERROR()` in handlers.
- Use `data` schemas only for fields the client truly needs, and never include sensitive information.
- Reserve thrown unknown errors for truly unexpected cases.
- Do not leak sensitive information through error data or messages.
- `ORPCError` is still valid when you need interoperability, but prefer `.errors(...)` so the client can infer and narrow error types.

Example:

```ts
const protectedExampleProcedure = protectedProcedure.errors({
  RATE_LIMITED: {
    data: z.object({
      retryAfter: z.number().int().min(1)
    }),
    status: 429
  },
  DATABASE_ERROR: {
    description: "Failed to update example",
    status: 500
  },
  EXAMPLE_NOT_FOUND: {
    message: "Example not found",
    status: 404
  }
});
```

Equivalent `ORPCError` throws are fine when the code, status, and data match a defined error, but the repo default should still be the typed `errors.*(...)` form.

## Logging

oRPC handlers receive the request-scoped logger as `context.logger`.

- Follow [Logging patterns](./logging.md) for event shape, emit lifecycle, redaction, and global error handling.
- Do not add durable procedure logs unless logging was explicitly requested or the flow is audit, security, or otherwise high-risk.
- Reuse `context.logger`; do not create a standalone logger inside a procedure.
- If extra context is needed for an unexpected failure, attach it with `logger.set(...)` and let shared error handling record the failure once.
- Do not log routine reads or duplicate middleware and global error logging.

When a handler genuinely needs a durable outcome log, use one wide terminal event:

```ts
.handler(async ({ context, input, errors }) => {
  const logger = context.logger;

  logger.set({
    procedure: "profile.edit",
    profile: { id: context.session.user.id },
  });

  const row = await updateProfile(input);

  if (!row) {
    throw errors.PROFILE_NOT_FOUND();
  }

  logger.emit({
    event: "profile_edit_completed",
    profile: { id: row.id },
  });

  return row;
})
```

## Router Conventions

- Group related procedures in a slice router, for example `profileRouter`.
- Prefer straightforward names like `byId`, `search`, `edit`, `create`, `remove`.
- Keep DB access close to the handler unless reuse clearly justifies extraction.
- If extraction is justified but the logic is still slice-local, colocate it beside the router in sibling files such as `queries.ts` or `utils.ts`. Do not push one-off router helpers into `packages/api/src/lib/` by default.
- Convert server-only values to transport-safe output values at the edge, for example `Date` → ISO string.
- Keep handler logic linear and shallow. If the flow grows, extract helpers.

## Router Folder Shape

The default slice-local router shape is:

```text
packages/api/src/routers/<slice>/
  index.ts
  queries.ts
```

Use sibling files for helpers that are only used by that router.

- `index.ts` owns the public router definition.
- `queries.ts` owns slice-local DB readers, aggregations, transport shaping helpers, and similar reusable helpers for that router.
- `utils.ts` or `constants.ts` are fine when the helper is still router-local and not shared elsewhere.
- Promote code into `packages/api/src/lib/` only when it is reused across multiple routers or is truly infrastructure-level.

## Shared Contracts

When an oRPC input or output schema represents a shared domain contract, source it from `packages/core` instead of redefining it locally.

- Follow [Core package patterns](./core.md) for shared enums, filters, categories, transport-safe shapes, and defaults consumed outside one router.
- Keep router-local helper queries and transport-only shapes next to the router.
- Keep cross-router or infrastructure helpers in `lib/` only when that reuse is real.

## Client Error Handling

Follow [API fetching patterns](./api-fetching-patterns.md) for query and mutation file structure.

- Prefer type-safe client error handling for oRPC-backed mutations and user-visible failure states.
- Import `isDefinedError` from `@orpc/client` when narrowing mutation or action errors.
- Prefer oRPC's built-in client helpers over custom error-guard utilities when the library already provides the needed narrowing.
- Switch on `error.code` instead of string-matching `message` text.
- Read `error.data` only for errors that define typed data in `.errors(...)`.
- If AI generates generic `instanceof Error` handling for defined server errors, steer it back to the typed `isDefinedError(error)` branch.

Example:

```ts
import { isDefinedError } from "@orpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { type client, orpc } from "@tsu-stack/api/client/tanstack-start/orpc";

export function getEditProfileMutationOptions() {
  return orpc.profile.edit.mutationOptions({
    onError: (error) => {
      if (isDefinedError(error)) {
        switch (error.code) {
          case "PROFILE_NOT_FOUND":
            toast.error(error.message ?? "Profile not found.");
            return;
          case "RATE_LIMITED":
            toast.error(`Try again in ${error.data.retryAfter} seconds.`);
            return;
          case "DATABASE_ERROR":
            toast.error(error.message ?? "Failed to update profile.");
            return;
        }
      }

      toast.error(error instanceof Error ? error.message : "Failed to update profile.");
    }
  });
}

export function useEditProfileMutation() {
  return useMutation(getEditProfileMutationOptions());
}

export type EditProfileMutationResult = Awaited<ReturnType<typeof client.profile.edit>>;
```

## Practical Rules

- Prefer explicit `input` and `output` schemas on every procedure.
- Prefer typed oRPC errors over ad hoc string matching.
- Prefer `.errors(...)` plus `errors.MY_ERROR(...)` over raw `new ORPCError(...)` unless interoperability or framework glue makes the raw form clearer.
- Prefer `isDefinedError(error)` plus `error.code`/`error.data` for client-side branching.
- Prefer sparse, request-scoped wide events over ad hoc per-step logs.
- Prefer shared error handling over log-and-rethrow patterns in handlers.
- Prefer [API fetching patterns](./api-fetching-patterns.md) for slice-local query and mutation wrappers, preloading, and cache invalidation.
