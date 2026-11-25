# Media storage and uploads

The starter has no object-storage implementation. Use these defaults when adding it and revise this guide in the same change to record the actual SDK, env, capabilities, limits, visibility, delete policy, and stable ownership boundaries.

## Ownership and contracts

- Prefer `files-sdk` with its MinIO adapter for S3-compatible storage. Keep the configured client and lifecycle I/O in the API infrastructure and call it from the owning slice router. Keep web UI and upload mutations in their owning slice.
- Use one generic `media_asset` row with ID, owner, purpose, opaque key, content type, size, status, and lifecycle timestamps. Set states for `pending_upload`, `uploaded_orphaned`, and `linked`. Keep alt text, labels, and other business metadata on the owner, linked by `mediaAssetId`.
- Keep Zod contracts, enums, limits, MIME allowlists, prefixes, and expiry defaults in [Core](core.md). Validate bounded file name, positive size, MIME, and purpose on the server. A signed contract includes the media ID, object key, enforced limits, and a discriminated `PUT` URL with headers or `POST` URL with form fields.
- Persist the key. Resolve public or CDN delivery through the storage adapter and mint short-lived signed downloads for private assets. Derive URLs at read time.

## Upload and delete

1. Authenticate and authorize the owner and purpose. Create a pending row with a UUID-based key before issuing the signed contract. Keep user filenames out of keys.
2. Upload from the browser directly to storage. Handle PUT headers and POST fields. Proxy file bytes only when the task calls for it.
3. Verify owned pending state and object existence before marking it claimable. Return typed errors for a missing row or upload. Link the asset to the owning domain row and mark it linked.
4. Default to synchronous hard delete. Delete the object, then remove the owning reference and media row in a transaction. Surface a typed failure when a step fails. For retention, soft delete, or async retry, confirm the affected asset classes and operating reason. An async design hides the reference, keeps the pending state, and uses idempotent retry and reconciliation. A retention design delays purge under an explicit policy.

## Deployment

Provision the bucket or prefix and decide public, CDN, or signed-private delivery. Scope object permissions to required operations and add listing only when needed. Configure browser CORS for intended origins, methods, content type, and required signed headers. Enforce type and size in application validation.

Preferred server env names are `MINIO_ENDPOINT`, `MINIO_BUCKET`, `MINIO_ACCESS_KEY_ID`, `MINIO_SECRET_ACCESS_KEY`, and optional `MINIO_PUBLIC_BASE_URL`. Follow [Env](environment-variables.md), [Database](database.md), and [oRPC](orpc.md) for propagation and validation.
