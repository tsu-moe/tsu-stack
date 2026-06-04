# Zustand State Management

Use this when adding or refactoring complex client-owned state that needs to be accessed from different components in `apps/web` or reusable UI packages.

For server data, route preloading, and mutations, follow [API fetching patterns](./api-fetching-patterns.md) and [TanStack patterns](./tanstack-patterns.md). Zustand is for client-owned state: UI coordination, local preferences, local drafts, local-first workflows, and reusable component state.

## Default Rule

- Default to Zustand when multiple components need to read or update the same client-owned state.
- Do not introduce `React.createContext`, call `React.useContext()`, or add new React context providers unless the user explicitly asks for React Context.
- If the only reason for Context is to pass shared state or actions between components, create a Zustand store instead.
- Keep existing context providers only when they provide stable dependencies or integration contracts, such as logging, routing, theming, or framework glue.
- Prefer props or component injection for simple parent-to-child configuration.
- Prefer local component state when only one component owns the state.

## Dependency

When adding the first Zustand store to a package, make sure the package declares `zustand` as a dependency. Use the workspace package-management rules from [Vite+ toolchain](./vite-plus.md).

## Goals

- Keep state owned by the smallest FSD slice that needs it.
- Put state transitions in store actions, not inline in components.
- Put React-facing hook wrappers in the owning slice's `hooks/` directory.
- Subscribe with selectors so components re-render only for the fields they use.
- Use global composed stores only when explicitly needed.

## File Naming

- Stores use `*.store.ts`.
- Slice creators use `*.slice.ts`.
- Hook wrappers use `use-*.hook.ts`.
- Use `*.tsx` only when the file contains JSX.

Examples:

- `filters.store.ts`
- `draft.slice.ts`
- `use-filter-state.hook.ts`

## Placement

Follow the FSD segment structure from [TanStack patterns](./tanstack-patterns.md).

```text
features/example/
  stores/
    filters.store.ts
  hooks/
    use-filter-state.hook.ts
  index.ts
```

Use the layer that owns the behavior:

- `pages/<slice>/stores/` for page-owned local UI state.
- `widgets/<slice>/stores/` for widget coordination state.
- `features/<slice>/stores/` for user-facing feature state.
- `entities/<slice>/stores/` for reusable entity-local state.
- `apps/web/src/shared/stores/` only for app-wide generic state with no business ownership.
- `apps/web/src/shared/hooks/` only for hooks around shared generic stores.
- `packages/ui` component folders may keep colocated stores only for reusable component-family state.

Do not create `src/stores/` or a global `stores.ts`.

## Store Shape

Prefer one typed store per concern.

```ts
import { create } from "zustand";

interface ToggleStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  open: () => void;
  close: () => void;
}

export const useToggleStore = create<ToggleStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false })
}));
```

Keep state fields first, then actions. Use plain action names: `setX`, `open`, `close`, `toggleX`, `resetX`, `initX`.

When an action needs multiple inputs, use a params object.

```ts
setSelection: (params: { itemId: string; groupId: string }) => void;
```

## Hook Wrappers

Export store hook wrappers from the slice's `hooks/` directory, not from component files.

```ts
import { useShallow } from "zustand/react/shallow";

import { useToggleStore } from "../stores/toggle.store";

export function useToggleState() {
  return useToggleStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      open: state.open,
      close: state.close
    }))
  );
}
```

Use direct selectors for single values.

```ts
const isOpen = useToggleStore((state) => state.isOpen);
```

Use `useShallow` when returning an object, array, or computed selector result. Avoid `useStore()` unless the store is tiny and the component truly needs every field.

## Updates

Use object `set` for simple replacements.

```ts
setValue: (value) => set({ value });
```

Use functional `set` when the next state depends on current state.

```ts
toggleId: (id) =>
  set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter((selectedId) => selectedId !== id)
      : [...state.selectedIds, id]
  }));
```

Keep updates immutable. Copy arrays, records, objects, Sets, and Maps instead of mutating existing state in place.

## Derived State

Keep cheap derived values in hook wrappers.

```ts
export function useSelectedCount() {
  return useSelectionStore((state) => state.selectedIds.length);
}
```

Store derived state only when it is expensive, shared outside React, or intentionally cached by the store. Otherwise derive it at the hook boundary.

## Async Actions

Async actions are fine when the workflow is client-owned and the store owns the state transition.

```ts
initDraft: async (id) => {
  const draft = await draftService.read(id);
  set({ draft });
};
```

Keep I/O details in `lib/` services. Use hook wrappers when coordinating router state, session state, server mutations, query invalidation, or effects.

Do not use Zustand as the server cache. Use TanStack Query and route `beforeLoad` preloading for server data.

## TanStack Integration

TanStack Router `beforeLoad` and loaders are not React components, so do not call Zustand hooks there.

- Use route context for dependencies that routes need.
- Use React Query option factories with `ensureQueryData(...)` for server data.
- Read or initialize Zustand from React components or hook wrappers after hydration.
- If a store change affects route guards or router context, call `router.invalidate()` from React code after the state change.

For TanStack Start SSR, keep initial renders deterministic. Browser-only state such as `localStorage`, media queries, or persisted Zustand state may differ between server and client; use a hydration-aware fallback when needed.

## Persisted Stores

Use `persist` only for durable client state.

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

const PREFERENCES_STORAGE_KEY = "preferences";
const PREFERENCES_STORE_VERSION = 1;

interface PreferencesStore {
  density: "compact" | "comfortable";
  setDensity: (density: PreferencesStore["density"]) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      density: "comfortable",
      setDensity: (density) => set({ density })
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      version: PREFERENCES_STORE_VERSION
    }
  )
);
```

Persisted stores should define a storage key constant. Add a version, `migrate`, and `partialize` when the stored shape may evolve or only some fields are durable.

Do not persist loading flags, modal state, request-scoped data, auth secrets, or server cache data.

## Slice Composition

Do not create centralized slice creators by default. Most Zustand stores should be isolated stores in the owning FSD slice.

Use `*.slice.ts` and a composed global local-data store only when one of these is true:

- The user explicitly asks for a shared global local-data store.
- The app needs to export, import, reset, or persist multiple local-data domains at once.
- Local-data domains need coordinated actions or cross-slice reads.

Keep business slice creators in their owning FSD slices. Put only the app-wide composition shell in `apps/web/src/shared/stores/` when composition is necessary.

```ts
import type { StateCreator } from "zustand";

export interface DraftSliceState {
  draftsById: Record<string, Draft>;
  upsertDraft: (draft: Draft) => void;
}

export const createDraftSlice: StateCreator<DraftSliceState> = (set) => ({
  draftsById: {},
  upsertDraft: (draft) =>
    set((state) => ({
      draftsById: {
        ...state.draftsById,
        [draft.id]: draft
      }
    }))
});
```

If one slice depends on another, type the full store as the first generic and the slice return as the fourth generic.

## SSR And Hydration

Zustand stores are module state. In SSR-capable apps, never put request-specific secrets, sessions, or authenticated server data in a module-level store.

- Keep auth and protected data server-driven when possible.
- Initialize client stores from safe serialized data only.
- Guard browser APIs from server execution.
- Let `persist` hydrate storage instead of reading `localStorage` during render.

## Anti-Patterns

- Introducing `React.useContext()` or a new React context provider when the user did not explicitly ask for Context.
- Using React Context for shared mutable client state.
- Creating a global store because two components share state once.
- Putting business state in `shared/` when a page, widget, feature, or entity owns it.
- Calling Zustand hooks in route `beforeLoad`, loaders, server functions, or non-React utilities.
- Subscribing to the whole store from large components.
- Mutating store collections in place.
- Persisting transient UI or server-owned data.
- Adding middleware without a concrete need.

## References

- Zustand `create`, `persist`, `useShallow`, and SSR guidance.
- TanStack Router context, data loading, and React Query integration.
- TanStack Start hydration and execution model guidance.
