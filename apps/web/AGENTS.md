# AGENTS.md

## Scope

These instructions apply to `apps/web`, the Next.js App Router web app. They
supplement the root repo instructions.

`apps/web` owns web routes, layouts, web-only shells, web auth adapters, web
styling integration, and web-specific product behavior.

---

## App Router Boundaries

- Use `app/` routes and layouts for route structure. Keep route-specific UI close
  to the route unless it is reused.
- Prefer server components by default. Use client components only for hooks,
  browser APIs, local interactive state, providers, or event tracking.
- Keep route handlers, server actions, SSR Supabase work, and cookie/session
  server logic inside `apps/web`. Do not move SSR behavior into
  `@repo/providers`.
- Keep web-only shells and composed app chrome under `components/`.
- Use `components/Providers.tsx` as the web provider composition root. Add
  app-wide providers there deliberately; do not hide app-wide side effects inside
  individual pages.

---

## Shared Packages

- Import shared UI from `@repo/ui`; do not deep-import from
  `packages/ui/src/...`.
- Import providers and hooks from `@repo/providers`; do not deep-import provider
  internals.
- Use `@repo/lib` only for stable shared client types/helpers. Do not duplicate
  API DTOs in app code.
- If a web component becomes useful to native as well, move the reusable UI into
  `packages/ui` as a proper web/native pair instead of copying it.

---

## Auth And Tracking

- Auth UI forms from `@repo/ui` receive actions through props. Keep the app-level
  bridge in `lib/uiAuthAdapter.ts` and web auth prop wiring in
  `lib/webAuthProps.ts`.
- Keep auth tracking coupled to the auth adapter flow so login, sign-up,
  sign-out, OTP, and password events stay consistent.
- Use `useActions` for meaningful authenticated user actions and first screen
  views. Use stable `uniqueKey` values for first-view events.
- Keep tracking metadata low-cardinality with fields such as `source`, `screen`,
  and `trigger`.

---

## Styling

- Use Tailwind in app code and prefer existing UI tokens before adding new visual
  values.
- Prefer canonical variable-backed Tailwind syntax:

```tsx
className="border-(--ui-border) bg-(--ui-subtle-bg) text-(--ui-fg)"
```

- Avoid verbose arbitrary color utilities when canonical token syntax works.
- App branding belongs in app-level token overrides and CSS variable mapping, not
  inside `packages/ui` internals.
- Preserve local visual language when editing existing screens. Keep loading,
  empty, error, and success states explicit.

---

## Verification

Run the narrowest relevant checks:

```sh
pnpm --filter web check-types
pnpm notifications:verify
```

Also run provider, UI, or API checks when the web change crosses those
boundaries.
