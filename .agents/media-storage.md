# Media Storage And Uploads

Use this when introducing or changing S3-compatible object storage, upload contracts, object-delete behavior, or the database record that tracks uploaded files.

This repo does not ship media storage yet. This file is prescriptive: when the first storage feature lands, follow these defaults, then update this file in the same change so future work reflects the real implementation instead of the template.

This file is the source of truth for the repo's default storage architecture until a real implementation lands.

This guide should stay aligned with:

- [Core package patterns](./core.md)
- [Environment variables](./environment-variables.md)
- [oRPC patterns](./orpc.md)
- [Workflow](./workflow.md)

## Goals

- Treat `media_asset` as a generic object-storage record. It can back images, documents, archives, avatars, or any other uploaded file.
- Keep object-storage metadata generic: owner, purpose, key, content type, size, and lifecycle timestamps. Derive delivery URLs from config and `key` instead of persisting them on the row.
- Keep business metadata on the owning row, not on `media_asset`. Alt text, captions, labels, and document titles belong to the domain record that links to the object.
- Default to direct browser-to-storage uploads, with the API brokering signed contracts and lifecycle state.
- Default to synchronized hard delete because it is the simplest lifecycle that does not require a sweeper or retry worker. Offer async or retention-based deletion only when the feature needs them.
- Keep soft-delete capability available for future exceptions, but do not build around it by default.

## First Implementation Rule

When the first storage feature is added to this repo, update this file in the same change to record the actual:

- provider and adapter choice
- env var names that were added
- shared upload purposes and size limits
- whether objects are public, CDN-backed, or signed-download only
- delete policy if it differs from synchronized hard delete
- concrete package or file locations if the implementation established stable conventions

If the first implementation does not update this file, treat that as incomplete work.

## Recommended Library

Use `files-sdk` for object storage access and signed uploads.

Default choice for this template:

- `files-sdk`
- `files-sdk/minio` for MinIO or other S3-compatible endpoints

If the first implementation chooses a different adapter or SDK, update this file immediately so later work follows the real stack.

When the repo uses `files-sdk`, prefer adapter-provided URL resolution such as `await files.url(key)` over hand-rolled public URL helpers.

Example client setup when the repo uses MinIO or another S3-compatible endpoint:

```ts
import { Files } from "files-sdk";
import { minio } from "files-sdk/minio";

export const files = new Files({
  adapter: minio({
    accessKeyId: ENV_SERVER.MINIO_ACCESS_KEY_ID,
    bucket: ENV_SERVER.MINIO_BUCKET,
    endpoint: ENV_SERVER.MINIO_ENDPOINT,
    publicBaseUrl: ENV_SERVER.MINIO_PUBLIC_BASE_URL,
    secretAccessKey: ENV_SERVER.MINIO_SECRET_ACCESS_KEY
  }),
  prefix: "uploads"
});
```

## Default Package Shape

If storage is introduced here, use this default split unless the task requires something more specific:

```text
packages/core/src/media-asset/
  constants.ts
  types.ts
  utils.ts
  index.ts

packages/db/src/schema/
  media-asset.schema.ts

packages/api/src/lib/storage/
  index.ts
  media-asset/index.ts
```

Default responsibilities:

- `packages/core/src/media-asset/constants.ts`: MIME lists, size limits, upload expiry durations, and other shared storage constants
- `packages/core/src/media-asset/types.ts`: `mediaAssetSchema`, upload request and response schemas, and inferred types
- `packages/core/src/media-asset/utils.ts`: pure key, prefix, and schema-derived helpers only
- `packages/db/src/schema/media-asset.schema.ts`: persistence schema, indexes, and persisted enums when needed
- `packages/api/src/lib/storage/index.ts`: configured `files` client only
- `packages/api/src/lib/storage/media-asset/index.ts`: `createMediaAssetUpload`, `completeMediaAssetUpload`, `deleteMediaAssetObject`, and other infrastructure-level storage helpers
- oRPC procedures: keep them in the owning slice router per [oRPC patterns](./orpc.md); do not create routers under `lib/storage`
- `apps/web`: keep upload mutations and UI in the owning feature slice; extract shared browser helpers only when more than one slice uses them

## Implementation Order

When implementing storage for the first time, prefer this order unless the task explicitly requires divergence:

1. Add shared constants, schemas, and pure helpers under `packages/core/src/media-asset/` following [Core package patterns](./core.md).
2. Add `packages/db/src/schema/media-asset.schema.ts`, then generate and apply the migration following [Workflow](./workflow.md).
3. Add storage env validation and runtime config following [Environment variables](./environment-variables.md).
4. Add the configured `files` client in `packages/api/src/lib/storage/index.ts`.
5. Add storage lifecycle helpers in `packages/api/src/lib/storage/media-asset/index.ts`.
6. Wire the owning oRPC procedures from the nearest slice router instead of inventing a new global storage router.
7. Add the web upload mutation and UI in the owning feature slice.

If the actual implementation needs a different path or split, update this file in the same change.

## Generic Media Asset Shape

Prefer shared Zod schemas over ad hoc TypeScript-only shapes. Define the literal values once, derive Zod enums from them, and infer the exported types from the schemas.

```ts
import { z } from "zod";

export const MEDIA_ASSET_PURPOSES = ["avatar", "document", "image", "archive"] as const;
export const MEDIA_ASSET_STATUSES = ["pending_upload", "uploaded_orphaned", "linked"] as const;

export const mediaAssetPurposeSchema = z.enum(MEDIA_ASSET_PURPOSES);
export const mediaAssetStatusSchema = z.enum(MEDIA_ASSET_STATUSES);

export const mediaAssetSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().min(1),
  purpose: mediaAssetPurposeSchema,
  key: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().nonnegative(),
  status: mediaAssetStatusSchema,
  uploadedAt: z.date().nullable(),
  linkedAt: z.date().nullable()
});

export type MediaAssetPurpose = z.infer<typeof mediaAssetPurposeSchema>;
export type MediaAssetStatus = z.infer<typeof mediaAssetStatusSchema>;
export type MediaAsset = z.infer<typeof mediaAssetSchema>;
```

Put the asset schema and upload contract schemas in `packages/core/src/media-asset/types.ts`. Keep URL resolution and other storage-client calls out of `packages/core` because they depend on runtime config.

Use the record schema for server-side and DB-adjacent code. If an API response needs a URL, derive it at read time from the current storage policy instead of adding URL fields to the persisted asset shape.

Do not store public, CDN, or signed-download URLs on `media_asset`. The canonical persisted delivery identifier is `key`, and the actual render or download URL should be derived from the current storage policy at read time.

Default meanings:

- `pending_upload`: the DB row exists, but the object has not been confirmed yet
- `uploaded_orphaned`: the object exists, but no owning record has claimed it yet
- `linked`: the object is attached to a domain row and is safe to render or download through product flows

Optional statuses such as `delete_pending`, `orphaned`, or `deleted` are reserved for explicit async cleanup or soft-delete designs. Do not introduce them into new flows by default.

## URL Derivation

Keep URL derivation out of the persisted asset schema.

- For public or CDN-backed assets, prefer the storage client's own resolver, for example `await files.url(asset.key)`, so the read path follows the configured adapter behavior.
- For signed-download assets, mint a short-lived URL on demand from the storage adapter when the read path needs it.
- If an API response needs to expose a URL, resolve it in that read path or in `packages/api/src/lib/storage/media-asset/index.ts` instead of persisting it on `media_asset`.
- Do not persist a field like `publicUrl` on `media_asset`; delivery policy can change without requiring row backfills.

Example read-side URL resolution:

```ts
const imageUrl = await files.url(asset.key);
```

## Upload Contracts

Keep request and result shapes in shared core code so API and web code import the same contract.

```ts
export const mediaAssetUploadRequestSchema = z.object({
  contentType: z.string().min(1),
  fileName: z.string().min(1).max(180),
  purpose: mediaAssetPurposeSchema,
  size: z.number().int().positive().max(8_000_000)
});

export const uploadContractSchema = z.discriminatedUnion("method", [
  z.object({
    headers: z.record(z.string(), z.string()).optional(),
    method: z.literal("PUT"),
    url: z.string().url()
  }),
  z.object({
    fields: z.record(z.string(), z.string()),
    method: z.literal("POST"),
    url: z.string().url()
  })
]);

export const mediaAssetUploadResultSchema = z.object({
  contract: uploadContractSchema,
  contentType: z.string().min(1),
  key: z.string().min(1),
  maxSize: z.number().int().positive(),
  mediaAssetId: z.string().uuid(),
  purpose: mediaAssetPurposeSchema
});
```

## Upload Flow Defaults

If the task does not specify a different transport, implement this default direct browser-to-storage flow.

### Request A Contract

- Validate content type, size, purpose, and file name before issuing a signed upload.
- Create the `media_asset` row before returning the contract so the app has an object ID to complete and link later.
- Use UUID-based keys. Do not depend on user filenames for canonical storage keys.
- Do not persist a derived delivery URL while issuing the contract. Store only canonical storage fields.
- Keep size limits, content-type allowlists, expiry times, and prefixes in shared config rather than duplicating them across UI and API code.

Example:

```ts
export async function createMediaAssetUpload(input: {
  contentType: string;
  fileName: string;
  ownerId: string;
  purpose: MediaAssetPurpose;
  size: number;
}) {
  const mediaAssetId = crypto.randomUUID();
  const key = `${input.ownerId}/${crypto.randomUUID()}`;

  await db.insert(schema.mediaAsset).values({
    contentType: input.contentType,
    id: mediaAssetId,
    key,
    ownerId: input.ownerId,
    purpose: input.purpose,
    size: input.size,
    status: "pending_upload"
  });

  return {
    mediaAssetId,
    contract: await files.signedUploadUrl(key, {
      contentType: input.contentType,
      expiresIn: 60,
      maxSize: 8_000_000
    })
  };
}
```

### Upload In The Browser

- Upload directly from the browser to object storage.
- Keep the client helper able to handle both `PUT` and `POST` style contracts.
- Do not proxy file bytes through the application server unless the user explicitly asks for that behavior.

### Complete The Upload

- Confirm the object exists before promoting `pending_upload` to a claimable state such as `uploaded_orphaned`.
- Return typed application errors when the row is missing or the object was never uploaded.

### Link To The Owning Row

- Link the uploaded object from the business table using `mediaAssetId`.
- Keep the owning row responsible for business metadata like alt text, labels, captions, or document names.

## Delete Lifecycle

Default to synchronized hard delete unless the task explicitly asks for queueing, retention, or retry semantics.

Choose the lifecycle deliberately:

### Synchronized Hard Delete

Use this when the feature is straightforward and storage deletes are cheap enough to stay on the request path.

- Flow: delete the storage object in the request path, then remove the `media_asset` row and owning row state.
- Benefits: smallest operational surface, no background worker, no periodic reconciliation.
- Costs: request success depends on storage availability and latency.
- Recommendation: start here unless the user explicitly needs a more resilient lifecycle.

### Async Delete With Retry

Use this when the site becomes large enough that request-path storage deletes become an operational liability.

- Flow: mark the asset as `delete_pending`, remove or hide the owning reference, enqueue storage deletion, and finalize the row after the worker succeeds.
- Benefits: faster request path, better retry behavior, safer handling of transient storage failures.
- Costs: requires a queue or worker, idempotent delete jobs, and occasional reconciliation for stuck states.
- Recommendation: prefer this once storage latency, traffic volume, or operational failure recovery matters more than implementation simplicity.

### Soft Delete Or Retention Window

Use this only when a feature, policy, or compliance rule requires undo, review, or delayed purge.

- Flow: mark the asset deleted in application state first, then purge the object later according to the retention rule.
- Benefits: supports restore flows and regulated retention requirements.
- Costs: highest complexity and the most policy surface to document and maintain.
- Recommendation: do not introduce this by default.

If a delete can fail, surface a typed application error instead of silently leaving partial state.

Example delete helper:

```ts
export async function deleteMediaAssetObject(key: string) {
  const result = await files.delete([key], { stopOnError: true });

  if (!result.deleted.includes(key)) {
    throw new Error(`Failed to delete storage object for key: ${key}`);
  }
}
```

Example ownership delete flow:

```ts
await deleteMediaAssetObject(asset.key);

await db.transaction(async (tx) => {
  await tx.delete(schema.owningRow).where(eq(schema.owningRow.id, owner.id));
  await tx.delete(schema.mediaAsset).where(eq(schema.mediaAsset.id, asset.id));
});
```

## Environment Variables

When adding S3-compatible uploads to this repo for the first time, prefer these server env names:

- `MINIO_ENDPOINT`: internal or SDK-facing S3-compatible endpoint
- `MINIO_PUBLIC_BASE_URL`: public or CDN base URL used by the storage adapter to resolve read-side URLs when the chosen delivery policy exposes public reads
- `MINIO_BUCKET`: bucket name
- `MINIO_ACCESS_KEY_ID`: object-storage access key
- `MINIO_SECRET_ACCESS_KEY`: object-storage secret

If the first implementation chooses different env names, update this file and [Environment variables](./environment-variables.md) in the same change.

For env propagation and the exact update checklist, follow [Environment variables](./environment-variables.md). Keep this file limited to the preferred storage-specific env names and storage policy.

## Permission And Policy Checklist

When implementing S3 uploads for the first time, also define the storage policy explicitly.

- Create the bucket or prefix intentionally instead of assuming it already exists.
- Decide whether objects are public, CDN-backed, or private signed-download assets.
- Grant only the minimum object permissions needed: usually `PutObject`, `GetObject`, `DeleteObject`, and `HeadObject`; add `ListBucket` only when the feature truly needs it.
- Scope permissions by bucket and prefix when the provider supports it.
- Configure CORS for browser uploads: expected origins, `PUT` or `POST`, `GET`, `HEAD`, allowed signed headers, and `Content-Type`.
- Keep public-read and signed-read strategies separate. Prefer the storage client's read-side URL resolver and do not persist a durable URL on the asset row.
- Enforce allowed content types and max size in application validation even if the bucket policy also restricts them.
- Decide delete behavior before shipping: synchronized hard delete by default, async delete with retry when the request path needs better resilience, soft delete only by explicit product or policy need.
- Update this file once the feature lands so future work inherits the real storage policy.

## Change Rules

- Model new asset classes as generic media-object purposes, not as feature-specific storage tables unless a real constraint requires a dedicated table.
- Keep shared upload contracts, size limits, MIME lists, and prefixes in shared code.
- Keep business metadata on the owning row.
- Keep delivery URLs derived from config and `key`, not persisted on `media_asset`.
- Prefer generic helper names such as `createMediaAssetUpload`, `completeMediaAssetUpload`, and `deleteMediaAssetObject` over feature-specific names unless the helper is truly slice-local.
- If the user asks for async delete, soft delete, delayed deletion, or object retention, stop and confirm the exact asset classes and operational reasons before implementing it.
