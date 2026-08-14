# oRPC Testing

Use this with [oRPC patterns](./orpc.md) when testing procedures or oRPC-backed client behavior.

## Direct Procedure Tests

Use `call` from `@orpc/server` as the default procedure-test API:

```ts
import { call } from "@orpc/server";

const output = await call(procedure, input, { context });
```

- Import the smallest procedure or slice router that owns the behavior. Do not import the application router when that pulls in unrelated databases, runtimes, or handlers.
- Build the smallest fully typed `OrpcContext` in the test. Keep one-off session and context fixtures in the test file.
- Use the real `createRequestLogger` for context. Do not mock oRPC, Better Auth, Hono, or procedure middleware to test normal handler behavior.
- Call procedures without HTTP when the behavior under test is validation, middleware, authorization, handler output, or typed errors.

## Auth and Errors

For a protected procedure, cover the smallest meaningful pair:

- an anonymous context rejects with `UNAUTHORIZED`
- an authenticated, typed Better Auth session reaches the handler

Assert defined errors through their public contract:

- `code`
- `status`
- typed `data` when the error defines it

Do not assert stack traces, internal causes, or incidental message text. Add role, permission, or session-expiry cases only when the procedure owns those branches.

## Boundaries and Mocking

- Mock only I/O boundaries such as a database adapter, clock, or external provider when using the real dependency would make the test nondeterministic or out of scope.
- Do not mock a procedure just to test its middleware or handler.
- Never use a remote service or an existing development database from unit tests.
- Keep fixtures local until multiple tests share a stable domain setup; do not introduce a generic fixture framework for one slice.

## When Direct Calls Are Not Enough

Use a fetch, Hono, or OpenAPI integration test only when transport behavior is the requirement, including headers, cookies, serialization, CORS, OpenAPI mapping, or handler mounting. Use browser E2E only when a user-visible application flow is the requirement.

For TanStack Query wrappers, follow [API fetching patterns](./api-fetching-patterns.md). Test wrappers only when they add owned behavior such as query-key construction, invalidation, option defaults, or typed error mapping; do not test oRPC or TanStack Query pass-through behavior.
