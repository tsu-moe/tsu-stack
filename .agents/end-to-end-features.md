# Implementation guides

Read the guides for the boundaries your change touches.

- Web behavior and data — [Routes and Query](data-flow.md), [API fetching](api-fetching-patterns.md), [UI](ui.md), [Zustand](zustand.md), [i18n](i18n.md), and [SEO](seo.md).
- Contracts and security — [TypeScript](typescript.md), [Core](core.md), [oRPC](orpc.md), [Procedure tests](orpc-testing.md), and [Auth](auth.md).
- Platform — [Database](database.md), [Environment](environment-variables.md), [Media uploads](media-storage.md), and [Logging](logging.md).

For work across runtime boundaries, identify the affected data, contracts, and trust boundaries. Update persistence and migrations when needed, reuse the API owner, and wire reads and writes through the route or UI. Instrument business-critical outcomes in the same change. Follow the [verification workflow](workflow.md) and test the highest-risk boundary.
