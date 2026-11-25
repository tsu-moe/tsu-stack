# oRPC testing

Use `call(procedure, input, { context })` from `@orpc/server` for procedure validation, middleware, auth, handler results, and typed errors. Import the smallest owning procedure or router. Build a fully typed `OrpcContext` with a real `createRequestLogger` and test-local session fixtures.

- For protected behavior, pair anonymous `UNAUTHORIZED` with a valid session reaching the handler. Add role, ownership, or expiry cases when the procedure owns that behavior.
- Assert public error `code` and defined `data` in direct calls. Check HTTP status at the transport boundary. Ignore incidental messages, causes, and stacks.
- Keep procedure and middleware real. Stub only I/O, such as the session lookup, persistence adapter, clock, or provider. See [Testing](testing.md) for isolation.
- Use fetch, Hono, or OpenAPI tests when headers, cookies, serialization, CORS, or mounting are the requirement. Test client wrappers when they own key construction, cache updates, or error mapping. Use browser coverage for user workflows.

See [oRPC](orpc.md) for procedure and error conventions.
