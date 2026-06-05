# AGENTS.md

## Scope

These instructions apply to `packages/ui`, the reusable cross-platform UI
package. They supplement the root repo instructions.

`packages/ui` owns shared UI primitives, composed shared components, auth UI
forms, theme tokens, token recipes, and platform-specific UI implementations.

---

## Component Contract

- App code imports from `@repo/ui`. Do not require apps to deep-import UI
  internals.
- Use `primitives` for low-level controls such as buttons, inputs, links, labels,
  text, icon buttons, checkboxes, selects, and layout primitives.
- Use `components` for composed UI such as cards, dialogs, auth forms, alerts,
  settings rows, empty states, and product-neutral composed patterns.
- Shared components follow this structure:

```txt
packages/ui/src/primitives/Button/
  Button.types.ts
  Button.web.tsx
  Button.native.tsx
```

```txt
packages/ui/src/components/Card/
  Card.types.ts
  Card.web.tsx
  Card.native.tsx
```

- Keep the shared prop contract in `.types.ts`. Update both `.web.tsx` and
  `.native.tsx` unless the change is intentionally platform-specific.
- Export new UI from both `src/index.web.ts` and `src/index.native.ts`.

---

## Creating UI

Prefer the generator for new shared UI:

```sh
pnpm ui:gen ComponentName --component
pnpm ui:gen PrimitiveName --primitive
```

Use a shared UI component only when reuse is real. Do not move app-specific
layout or brand-specific chrome into this package.

---

## Styling And Theme

- `packages/ui` defines the token contract and defaults. Apps provide values.
- For web UI, prefer CSS variables exposed by the theme:
  `var(--ui-bg)`, `var(--ui-fg)`, `var(--ui-border)`,
  `var(--ui-subtle-bg)`, `var(--ui-muted-fg)`, `var(--ui-primary-bg)`, and
  `var(--ui-primary-fg)`.
- For native UI, use `useThemeTokens()` or recipes from `src/theme`.
- Avoid fixed neutral colors when a component must work in both light and dark
  mode.
- Do not edit UI internals to brand one app. Override app-level tokens instead.

---

## Auth UI

- Auth forms under `src/components/auth` are UI-level components only.
- Auth UI owns form state, validation display, layout, and interaction details.
- Auth UI receives auth actions through props and must not import
  `@repo/providers`.
- App adapters connect providers to UI:
  `apps/web/lib/uiAuthAdapter.ts` and `apps/native/lib/uiAuthAdapter.ts`.

---

## Verification

Run these checks for UI structure or behavior changes:

```sh
pnpm --filter @repo/ui typecheck
pnpm ui:validate
```

Also run app typechecks when a UI change affects app usage.
