# Web UI and shared components

Use the existing design system. Follow [i18n](i18n.md) for user-facing copy and locale-aware links.

- Compose existing `@tsu-stack/ui/components/*` primitives first. Prefer app-owned wrappers when router, images, locale, or app configuration matters. Use Lucide icons and `cn` from `@tsu-stack/ui/lib/utils`.
- Use the primitive’s composition API when combining a trigger, slot, or behavior with another component. Use Base UI `render`, Radix `asChild`, or a documented `as` prop. For example, compose a dropdown trigger with `render={<Button />}` and put the avatar inside the button. Forward the ref and received props to the same DOM element so keyboard handlers, accessible names, and focus management work together.
- Use the shared component for its variants and behavior. Keep Tailwind variant helpers inside the component that owns them. Render a button-styled navigation link with `<Button nativeLink render={<Link to="/dashboard" />}>Dashboard</Button>` so it has native link semantics. Keep a single interactive element per control and use a native button for actions.
- Pass data or per-usage config as props. Inject optional link or image components when implementation varies by app, with semantic defaults and a small prop surface. Support router `to` and plain `href` where needed. Group related media config in one object. Keep CDN and proxy choices with the app wrapper.
- Use [the shadcn config](../packages/ui/components.json) for style, base color, CSS variables, and icons.
- Use [Zustand](zustand.md) when several components share mutable client state.

## Foreground alignment and background placeholders

- Keep foreground dimensions, positioning, alignment, and aspect ratio as the source of truth. Never enlarge, scale, or offset foreground content to cover a background artifact.
- Place loading images, videos, gradients, or WebGL canvases behind the foreground and out of normal flow. Fit them to the layout container that the foreground sizes, or to its assigned panel in a responsive layout.
- Clip the layers at a shared rounded container using appropriate overflow or clipping. Check that compositing and antialiasing do not expose the placeholder around a ready surface.
- Keep CSS responsible for the displayed size. For WebGL, derive backing-buffer dimensions from the same layout box and account for fractional CSS pixels, device pixel ratio, and resizing.
- Inspect all four rendered corners across viewport sizes and device pixel ratios. Check the placeholder, loading transition, ready content, and resizing.
