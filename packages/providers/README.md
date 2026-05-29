# `@repo/providers`

Shared application providers for **Unified Web Native Stack (UWNS)**.

This package contains **cross-platform React providers** that are used by both the **Next.js web app** and the **Expo native app**.
Providers expose a **single API surface** while internally handling platform-specific behavior.

---

## What lives in this package

* **Auth provider (Supabase)** – shared authentication state and helpers
* (Future) Theme provider
* (Future) Feature flags, app config, etc.

Providers here are:

* **client-side**
* **platform-aware**
* **safe to reuse across apps**

---

## Auth provider (Supabase)

The auth provider exposes a single hook and provider that works in both **web** and **native** environments.

### Key features

* One `AuthProvider` for both platforms
* One `useAuth()` hook
* Correct session persistence per platform:

  * Web → `localStorage`
  * Native → `AsyncStorage`
* Automatic auth state syncing
* Email/password auth and Supabase email OTP auth

---

## Usage

### 1. Wrap your app

#### Next.js (web)

```tsx
"use client";

import { AuthProvider } from "@repo/providers";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
```

Use this component in your root layout.

---

#### Expo (native)

```tsx
import { Stack } from "expo-router";
import { AuthProvider } from "@repo/providers";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}
```

---

### 2. Access auth state

```ts
import { useAuth } from "@repo/providers";

const { user, session, loading } = useAuth();
```

* `loading` → auth state is initializing
* `user` → authenticated user or `null`

---

### 3. Auth actions

```ts
const {
  signInWithPassword,
  signUpWithPassword,
  sendEmailOtp,
  verifyEmailOtp,
  signOut,
  resetPasswordForEmail,
  updatePassword,
} = useAuth();
```

All methods throw on error — handle them at the call site.

#### Email OTP

```ts
await sendEmailOtp({
  email,
  emailRedirectTo,
  shouldCreateUser: true,
});

await verifyEmailOtp({ email, token });
```

Use `shouldCreateUser: true` when magic link should create an account on first request.
Supabase controls whether the email contains a magic link, a one-time code, or both through the email template. Include both `{{ .ConfirmationURL }}` and `{{ .Token }}` when the app should support both paths.

Add the app redirect targets in Supabase Auth settings:

* Web: the app URL that should receive the magic link redirect, for example `/app`
* Native: the Expo scheme/deep link URL, for example `native://`

---

## Environment variables

### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

### Native (`apps/native/.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Platform behavior

| Platform | Session storage | URL detection |
| -------- | --------------- | ------------- |
| Web      | localStorage    | Enabled       |
| Native   | AsyncStorage    | Handled from deep links |

This logic is handled internally — apps do **not** need to care.

---

## Notes on SSR (Next.js)

This provider manages **client-side auth state only**.

If server-side Supabase auth is needed later:

* Use `@supabase/ssr` **inside the web app**
* Do **not** add SSR logic to this package

This keeps `@repo/providers` portable and platform-agnostic.

---

## Adding new providers

* Each provider should:

  * Live in its own folder under `src/`
  * Export a Provider component + hook
  * Avoid platform checks in app code
* Platform differences belong **inside the provider**, not the app

---

## Summary

`@repo/providers` centralizes shared application state while respecting platform boundaries.
Apps consume providers declaratively; platform details stay hidden.
