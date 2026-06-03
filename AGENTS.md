# AGENTS.md

## Scope

These instructions apply to this repository. They supplement the global engineering defaults and are focused on how frontend agents should use `packages/ui` and `packages/providers`.

This repo is a Turbo monorepo with:

- `apps/web` for the Next.js app
- `apps/native` for the Expo app
- `packages/ui` for reusable cross-platform UI
- `packages/providers` for reusable cross-platform app providers such as auth

Keep package boundaries explicit. App routes and screens live in apps. Shared UI and shared provider behavior live in packages only when reuse is real.

---

## `packages/ui` Usage Pattern

### Importing UI

App code should import reusable UI from `@repo/ui`:

```ts
import { Button, Card, Input } from "@repo/ui";
```

Do not deep-import from `packages/ui/src/...` in app code. The package export map resolves the correct platform entry:

- web -> `packages/ui/src/index.web.ts`
- native -> `packages/ui/src/index.native.ts`

### Component Structure

Shared UI components follow this pattern:

```txt
packages/ui/src/primitives/Button/
  Button.types.ts
  Button.web.tsx
  Button.native.tsx
```

or:

```txt
packages/ui/src/components/Card/
  Card.types.ts
  Card.web.tsx
  Card.native.tsx
```

Use `primitives` for low-level controls such as buttons, inputs, links, labels, text, and icon buttons. Use `components` for composed UI such as cards, dialogs, auth forms, alerts, settings rows, and empty states.

When changing a shared component, update both `.web.tsx` and `.native.tsx` unless the change is intentionally platform-specific. Keep the shared prop contract in the `.types.ts` file.

### Creating UI

Prefer the generator for new shared UI:

```sh
pnpm ui:gen ComponentName --component
pnpm ui:gen PrimitiveName --primitive
```

The generator creates web/native/type files and updates both platform indexes. If adding manually, update both:

- `packages/ui/src/index.web.ts`
- `packages/ui/src/index.native.ts`

### Styling Rules

Use the existing token system before adding new styling values.

For web UI inside `packages/ui`, prefer CSS variables exposed by the theme:

- `var(--ui-bg)`
- `var(--ui-fg)`
- `var(--ui-border)`
- `var(--ui-subtle-bg)`
- `var(--ui-muted-fg)`
- `var(--ui-primary-bg)`
- `var(--ui-primary-fg)`

For web app code using Tailwind, prefer canonical variable-backed utilities:

```tsx
className="border-(--ui-border) bg-(--ui-subtle-bg) text-(--ui-fg)"
```

Avoid fixed neutral colors in shared UI when the element must work in both light and dark mode.

For native UI, use `useThemeTokens()` or token recipes from `packages/ui/src/theme`. Do not hard-code colors unless the value is truly platform-specific and not part of the shared design system.

### Theme Model

`packages/ui` defines the token contract and defaults. Apps provide values.

- Web maps tokens to CSS variables via `tokensToCssVars`.
- Native passes tokens through `ThemeProvider`.

Do not edit UI internals to brand one app. Override app-level tokens instead.

### Auth UI

Auth forms in `packages/ui/src/components/auth` are UI-level components. They receive auth actions through props and should not import `@repo/providers` directly.

The app adapters connect providers to UI:

- `apps/web/lib/uiAuthAdapter.ts`
- `apps/native/lib/uiAuthAdapter.ts`

Keep that separation. UI owns form state, layout, validation display, and interaction details. Providers own auth state and Supabase calls.

---

## `packages/providers` Usage Pattern

### Importing Providers

App code should import providers and hooks from `@repo/providers`:

```ts
import { AuthProvider, useAuth } from "@repo/providers";
```

Do not deep-import provider internals into apps.

The package export map resolves the correct platform entry:

- web -> `packages/providers/src/index.web.ts`
- native -> `packages/providers/src/index.native.ts`

### Current Auth Pattern

Auth uses this shape:

```txt
packages/providers/src/auth/
  auth.types.ts
  AuthProvider.shared.tsx
  AuthProvider.web.tsx
  AuthProvider.native.tsx
```

`AuthProvider.shared.tsx` contains the shared React context, session state, and Supabase auth methods. Platform wrappers provide platform-specific dependencies:

- web uses the web Supabase client
- native uses the native Supabase client and React Native `Linking` for auth URLs

Auth exposes one provider and one hook:

```tsx
<AuthProvider>{children}</AuthProvider>
```

```ts
const { user, session, loading, signOut } = useAuth();
```

Auth methods throw on error. UI or app code should handle errors at the call site.

### Adding More Providers

Use the same pattern for future shared providers:

```txt
packages/providers/src/example/
  example.types.ts
  ExampleProvider.shared.tsx
  ExampleProvider.web.tsx
  ExampleProvider.native.tsx
```

Use a shared file when behavior is genuinely shared. Put platform-specific setup in the platform wrappers or platform-specific support files.

Export the provider and hook from both platform indexes:

- `packages/providers/src/index.web.ts`
- `packages/providers/src/index.native.ts`

Keep apps consuming only the public provider and hook from `@repo/providers`.

### Provider Responsibilities

Providers should own shared application context and integrations, such as:

- auth
- feature flags
- app configuration
- customer/account context
- other cross-platform state that both apps actually use

Providers should not own app routing, screens, or app-specific layout. Those stay in `apps/web` and `apps/native`.

### Platform Boundaries

Hide platform differences inside `packages/providers`.

Good examples:

- storage differences
- Supabase client construction
- native deep-link handling
- web-only browser behavior

Avoid pushing platform checks such as `Platform.OS` or `typeof window` into app call sites when a provider can encapsulate the difference.

For Next.js SSR-specific Supabase work, keep server-side logic inside `apps/web`. `@repo/providers` is for client-side shared providers.

---

## App Composition

Web composes providers in `apps/web/components/Providers.tsx`.

Native composes providers in `apps/native/app/_layout.tsx`.

When adding a new shared provider, wire it into the app composition roots deliberately. Do not hide app-wide side effects inside individual screens.

---

## Verification

Run the narrowest relevant checks after changes:

```sh
pnpm --filter @repo/ui typecheck
pnpm --filter @repo/providers check-types
pnpm --filter web check-types
pnpm --filter native check-types
```

For UI package structure changes, also run:

```sh
pnpm ui:validate
```

