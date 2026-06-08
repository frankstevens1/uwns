---
title: Native app
description: How the Expo surface fits into the UWNS architecture.
section: Architecture
order: 11
---

# Native app

The native app lives in `apps/native` and uses Expo with React Native and
TypeScript. It owns native screens, navigation, native auth adapters, push
registration, device tokens, and native-specific action tracking.

## Platform ownership

Native code should feel native. Share business logic, validation, providers, and
contracts where practical, but do not force web UI patterns into the native app.

## Shared providers

Use `@repo/providers` for shared auth, action, notification, and Supabase client
behavior. Keep native token storage and platform-specific adapters in the native
app boundary.

## Push notifications

Expo push registration belongs to the native app. The API and Supabase schema
own notification records, preferences, delivery attempts, and service-side
validation.

## Verification

For native changes, use the narrowest relevant check:

```sh
pnpm --filter native check-types
```

Run notification checks when token registration, preferences, or delivery
metadata changes.
