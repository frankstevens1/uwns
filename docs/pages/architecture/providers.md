---
title: Providers
description: Shared client-side state, integrations, and provider boundaries.
section: Architecture
order: 13
---

# Providers

Shared providers live in `packages/providers`. They encapsulate reusable
client-side behavior such as auth state, action tracking, notification state,
Supabase client setup, and public exports consumed by apps.

## Boundary

Use providers to hide platform differences from app call sites when the behavior
is genuinely shared. Do not push web SSR cookie logic into providers; that stays
inside `apps/web`.

## Auth

Apps wire platform-specific auth adapters into shared UI and provider behavior.
Auth UI lives in `@repo/ui`; provider hooks expose session and user state.

## Actions and notifications

Use `useActions` for meaningful authenticated user intent, outcomes, and first
entries into authenticated product screens. Keep metadata low-cardinality and
stable.

Notification providers should expose client state and interactions, while
service-owned writes and delivery side effects stay behind the API.

## Verification

For provider changes, run:

```sh
pnpm --filter @repo/providers check-types
```

Run web or native checks when app usage changes.
