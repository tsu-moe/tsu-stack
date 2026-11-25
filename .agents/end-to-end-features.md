# End-to-end features

Start at the lowest layer the feature actually changes, then work toward the UI.

1. Update [database schema and migrations](database.md) for new persisted data.
2. Define shared schemas, enums, defaults, and helpers in [Core](core.md) when consumers cross package boundaries.
3. Extend the [oRPC contract](orpc.md) or reuse an existing owner such as [Better Auth](auth.md). Include [logging](logging.md#business-critical-features) in business-critical work.
4. Define [slice-local queries and mutations](api-fetching-patterns.md), including cache reconciliation and safe user-facing error mapping.
5. Wire [routes and guards](data-flow.md), [page UI](ui.md), [copy](i18n.md), and [SEO](seo.md) as applicable.
6. Run the scoped [fixes](workflow.md) and [tests](testing.md), including a regression at the boundary with the highest risk.
