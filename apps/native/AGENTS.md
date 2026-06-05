# AGENTS.md

## Scope

These instructions apply to `apps/native`, the Expo app. They supplement the
root repo instructions.

`apps/native` owns Expo routes, native screens, native-only components, native
auth adapters, push registration integration, and native-specific product
behavior.

---

## Expo Boundaries

- Use Expo Router files under `app/` for navigation and screen entrypoints.
- Keep native-only visual composition under `components/` unless the component is
  genuinely reusable across web and native.
- Use `app/_layout.tsx` as the native provider composition root. Add app-wide
  providers there deliberately; do not hide app-wide side effects inside
  individual screens.
- Keep native deep-link handling and auth redirect details in native app helpers
  or provider platform wrappers, not scattered across screens.
- Prefer React Native primitives and platform-conventional UX over forcing web UI
  patterns into native.

---

## Shared Packages

- Import shared UI from `@repo/ui`; do not deep-import from
  `packages/ui/src/...`.
- Import providers and hooks from `@repo/providers`; do not deep-import provider
  internals.
- Use `@repo/lib` only for stable shared client types/helpers. Do not duplicate
  API DTOs in app code.
- If a native component becomes useful to web as well, move the reusable UI into
  `packages/ui` as a proper web/native pair instead of copying it.

---

## Auth, Push, And Tracking

- Auth UI forms from `@repo/ui` receive actions through props. Keep the app-level
  bridge in `lib/uiAuthAdapter.ts` and native auth prop wiring in
  `lib/nativeAuthProps.ts`.
- Keep native auth focus, redirect, and deep-link helpers in `lib/`.
- Push registration belongs at the provider/platform integration boundary. Do not
  register push tokens from arbitrary screens.
- Use `useActions` for meaningful authenticated user actions and first screen
  views. Use stable `uniqueKey` values for first-view events.
- Keep tracking metadata low-cardinality with fields such as `source`, `screen`,
  and `trigger`.

---

## Styling

- Use `@repo/ui` primitives/components where possible.
- For native UI from `packages/ui`, consume tokens through `useThemeTokens()` or
  token recipes. Do not hard-code shared colors in native components.
- Keep layout constants in `constants/` only when they are app-level native
  decisions.
- Keep loading, empty, error, and success states explicit.

---

## Verification

Run the narrowest relevant checks:

```sh
pnpm --filter native check-types
pnpm notifications:verify
```

Also run provider, UI, or API checks when the native change crosses those
boundaries.
