# AGENTS.md

## Scope

These instructions apply to `packages/providers`, the reusable cross-platform
provider package. They supplement the root repo instructions.

`packages/providers` owns client-side shared app context and integrations such
as auth, actions, notifications, Supabase client construction, and platform
wrappers.

---

## Public API

- App code imports providers and hooks from `@repo/providers`.
- Do not require apps to deep-import provider internals.
- Export provider APIs from both `src/index.web.ts` and `src/index.native.ts`.
- Provider methods should expose stable, typed contracts and throw or surface
  errors consistently at the call site.

---

## Provider Structure

Use this pattern for shared providers:

```txt
packages/providers/src/example/
  example.types.ts
  ExampleProvider.shared.tsx
  ExampleProvider.web.tsx
  ExampleProvider.native.tsx
```

- Put shared React context, state, and behavior in `.shared.tsx`.
- Put platform-specific setup in `.web.tsx`, `.native.tsx`, or support files.
- Hide platform differences such as storage, Supabase client construction,
  native deep links, and browser behavior inside the provider package.
- Do not put app routing, screens, or app-specific layout in providers.

---

## Current Providers

- `auth` owns client-side Supabase auth state and auth methods.
- `actions` owns action history state, API calls, realtime updates, and
  `trackAction`.
- `notifications` owns notification history, preferences, push-token
  registration integration, realtime updates, and notification state updates
  triggered by actions.

Keep the action and notification providers coordinated through explicit provider
composition, not hidden global state.

---

## Supabase And API Boundaries

- Client-side Supabase clients belong here when shared by web and native.
- Next.js SSR-specific Supabase work belongs in `apps/web`, not here.
- Authenticated product operations should go through `@repo/lib` API client and
  `services/api` when they need service-owned writes or delivery side effects.
- Providers may degrade gracefully for missing sessions or unavailable API calls,
  but should not silently hide programming errors in provider setup.

---

## Verification

Run provider checks after provider changes:

```sh
pnpm --filter @repo/providers check-types
```

Also run affected app checks and API/lib checks when contracts change.
