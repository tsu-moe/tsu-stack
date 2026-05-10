# UI Package Patterns

## Purpose

Keep `packages/ui` reusable and app-agnostic. Shared UI components must not import app-level routing, image, env, or framework-specific wrappers from `apps/*`.

## Dependency Injection Rule

When a shared component needs an app-specific primitive, inject it instead of importing it.

- Navigation: accept `linkComponent?: React.ElementType`, default to `"a"`
- Media: accept `imageComponent?: React.ElementType`, default to the shared `packages/ui` image primitive or a semantic fallback
- Future wrappers: apply the same pattern for things like video, avatar, markdown, analytics-aware buttons, or other app-owned components

## API Shape

- Keep semantic HTML owned by the shared component: `article`, `header`, `footer`, `nav`, `ul`, `time`, and similar structure stay in `packages/ui`
- Inject only the leaf primitive that changes between apps
- Keep injected component props optional and typed as `React.ElementType`
- Forward the smallest useful prop surface to injected components
- When router links may need either router `to` or plain `href`, support both and let the injected link decide what to use
- For configurable media, keep related props grouped in a nested object like `image={{ src, alt, siteBaseUrl, imgProxyBaseUrl }}` instead of scattering env-specific props across the card API

## Decision Rule

- Use prop injection when only data or one-off config changes per usage
- Use component injection when behavior or implementation changes per app
- Prefer component injection when the same app-specific dependency would otherwise be repeated across many call sites
- For shared UI state that coordinates sibling components inside `packages/ui`, prefer a small colocated Zustand store over prop drilling or adding React context only to shuttle open/close state

## Do and Don't

- Do keep `packages/ui` free of imports from `apps/web`, TanStack Router, or app env modules
- Do provide sensible defaults so shared components still work without an injected dependency
- Do keep styling, layout, and accessibility inside the shared component
- Do colocate shared UI stores near the component family that owns the behavior, for example `components/header/store.ts`
- Don't hardcode CDN, proxy, locale, analytics, or router behavior into `packages/ui`
- Don't introduce React context or do excessive prop-drilling for simple cross-component UI coordination when a colocated Zustand store is enough
- Don't expose app-specific implementation details unless they are required for reuse

## Reference Pattern

```tsx
type CardProps = {
  linkComponent?: React.ElementType;
  imageComponent?: React.ElementType;
  href: string;
  image?: {
    src: string;
    alt?: string;
    siteBaseUrl?: string;
    imgProxyBaseUrl?: string;
  };
};
```

This keeps the shared package reusable while allowing each app to inject its own `Link`, `Image`, or future wrapper components.
