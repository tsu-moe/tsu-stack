# UI Guidelines

## Component Selection

Default to the existing design system. Before adding a visible interactive control or reusable UI block, check:

1. `packages/ui/components`
2. `apps/web/src/shared/ui`
3. Existing nearby page, feature, or widget components with the same pattern

Prefer the `packages/ui` component when one exists, even for small controls like buttons, inputs, labels, menus, dialogs, tabs, checkboxes, switches, selects, tooltips, sheets, toasts, and badges. Compose those primitives with local layout and state instead of hand-rolling a parallel design.

## Missing Components

If the needed component or primitive is not available, pause and ask the user how they want to proceed. Offer the practical choices:

- Create an app-scoped component for this web app.
- Create a package-scoped component in `packages/ui` for reuse.
- Install a shadcn component app-scoped with `vp run -w ui:web add <component>`.
- Install a shadcn component package-scoped with `vp run -w ui add <component>`.
- Use a specific component or design reference the user points to.

Do not invent bespoke visual primitives, copy random markup from examples, or fall back to raw browser controls for visible app UI unless the user explicitly asks or the element is purely semantic structure such as `main`, `section`, `form`, `ul`, or `label`.

## Icons And Images

- Use `lucide-react` for icons. Use `react-icons` only for brand icons or when lucide lacks the icon.
- Use the `<Image>` component from `apps/web/src/shared/ui/image.tsx` for automatic optimization. Do not use `<img>` directly.

## Coherence

- Match nearby spacing, typography, radius, borders, density, and interaction states.
- Keep operational app screens quiet and scannable: avoid these unless explicitly instructed — marketing-style blocks, decorative panels, and one-off design motifs.
- Keep page-level composition in `pages/`; promote components only after reuse is real.
