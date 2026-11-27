# Web UI and shared components

Use this for work in the web app or `packages/ui`. Follow [Web routes](data-flow.md) for page ownership and [i18n](i18n.md) for user-facing copy and locale-aware links.

- Compose existing `@tsu-stack/ui/components/*` primitives first. Prefer app-owned wrappers when router, images, locale, or app configuration matters. Use Lucide icons and `cn` from `@tsu-stack/ui/lib/utils`.
- Use the primitive’s composition API when combining a trigger, slot, or behavior with another component. Use Base UI `render`, Radix `asChild`, or a documented `as` prop. For example, compose a dropdown trigger with `render={<Button />}` and put the avatar inside the button. Forward the ref and received props to the same DOM element so keyboard handlers, accessible names, and focus management work together.
- Use the shared component for its variants and behavior. Keep Tailwind variant helpers inside the component that owns them. Render a button-styled navigation link with `<Button nativeLink render={<Link to="/dashboard" />}>Dashboard</Button>` so it has native link semantics. Keep a single interactive element per control and use a native button for actions.
- Build full pages in their page slices and compose features and widgets there. Keep app-wide primitives in `shared/ui`. Keep copy focused on outcomes and next actions. Follow [TypeScript](typescript.md) for slice types.
- Extract into `packages/ui` when a component has real reuse and can own semantic HTML, styling, and accessibility without app, Router, env, locale, or analytics imports. Keep route and product integrations in the app.
- Pass data or per-usage config as props. Inject optional link or image components when implementation varies by app, with semantic defaults and a small prop surface. Support router `to` and plain `href` where needed. Group related media config in one object. Keep CDN and proxy choices with the app wrapper.
- Use [the shadcn config](../packages/ui/components.json) for style, base color, CSS variables, and icons. Put reusable primitives in the shared package and app glue in the owning slice.
- For shared state inside a reusable component family, keep a small colocated [Zustand store](zustand.md) when multiple components need it. Prefer props or local state for a single owner.
