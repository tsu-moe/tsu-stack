# API Fetching Patterns

Use this when adding or refactoring TanStack Query code in `apps/web` slices.

## Goals

- Keep route files thin.
- Keep `orpc` and TanStack Query wiring inside slice-local `api/` modules.
- Keep page and feature components consuming hooks, not raw `useQuery(orpc...)` or `useMutation(orpc...)` calls.

## File Naming

- Queries use `*.query.ts`.
- Mutations use `*.mutation.ts`.
- Prefer one operation per file.
- Match the filename to the exported hook name.

Examples:

- `get-profile.query.ts` → `useGetProfileQuery`
- `search-profiles.query.ts` → `useSearchProfilesQuery`
- `create-profile.mutation.ts` → `useCreateProfileMutation`

## Placement

Put these files in the slice that owns the behavior.

```text
pages/profile/
  api/
    get-profile.query.ts
  ui/
    profile-id-page.tsx
  index.ts
```

Do not centralize app queries in a global `queries.ts` or `mutations.ts` file when the behavior belongs to one page or feature slice.

When a filter, category, sort, or other domain type is shared across packages, import it from `packages/core`. Do not redefine the same literal union locally. Follow [Core package patterns](./core.md) when introducing that shared contract.

## Query Module Shape

Each query file should usually export:

- query keys object
- query options factory
- hook wrapper
- result type when useful

```ts
import { useQuery } from "@tanstack/react-query";

import { type client, orpc } from "@tsu-stack/api/client/tanstack-start/orpc";

export const profileQueryKeys = {
  byId(id: string) {
    return orpc.profile.byId.key({ input: { id } });
  }
};

export function getProfileQueryOptions(id: string) {
  return orpc.profile.byId.queryOptions({
    input: { id }
  });
}

export function useGetProfileQuery(id: string) {
  return useQuery(getProfileQueryOptions(id));
}

export type ProfileQueryResult = Awaited<ReturnType<typeof client.profile.byId>>;
```

## Mutation Module Shape

Each mutation file should usually export:

- mutation options factory
- hook wrapper
- any helper invalidation logic or key helpers the slice needs

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type client, orpc } from "@tsu-stack/api/client/tanstack-start/orpc";

import { profileQueryKeys } from "@/pages/profile/api/get-profile.query";

export function createProfileMutationOptions() {
  return orpc.profile.create.mutationOptions();
}

export function useCreateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.profile.create.mutationOptions({
      onSuccess: async (profile) => {
        await queryClient.invalidateQueries({
          queryKey: profileQueryKeys.byId(profile.id)
        });
      }
    })
  );
}

export type CreateProfileMutationResult = Awaited<ReturnType<typeof client.profile.create>>;
```

## Route Integration

Route files should import query option factories from the slice barrel and preload them in `beforeLoad`.

```ts
export const Route = createFileRoute("/{-$locale}/(root-layout)/profile/$id/")({
  beforeLoad: ({ context, params }) => {
    void context.queryClient.ensureQueryData(getProfileQueryOptions(params.id));
  },
  component: ProfileIdPage
});
```

Use React Query for caching. Do not rely on the router loader cache.

## Component Usage

- Use the exported hook in the page, feature, or widget component.
- Do not call `useQuery(orpc...)` or `useMutation(orpc...)` inline in app UI code.
- Keep invalidation logic using exported query key helpers.

```ts
const profileQuery = useGetProfileQuery(profileId);

await queryClient.invalidateQueries({
  queryKey: profileQueryKeys.byId(profileId)
});
```

## Naming Rules

- `get-*` query files export `useGet*Query`.
- Non-`get` query files keep the same verb in the hook name.
- Mutation hooks use `use<CreateVerb><Entity>Mutation`.
- Query option factories should read naturally from the operation name: `getProfileQueryOptions`, `searchProfilesQueryOptions`, `getArticlesQueryOptions`.
