---
title: UI components
description: How shared UI primitives and components are organized and consumed.
section: Architecture
order: 12
---

# UI components

Shared UI lives in `packages/ui`. App code imports from `@repo/ui` and should
not deep-import package internals.

## Component contract

Low-level controls live under primitives. Composed product-neutral UI lives under
components. Shared components usually have a shared type file and separate web
and native implementations.

```txt
packages/ui/src/primitives/Button/
  Button.types.ts
  Button.web.tsx
  Button.native.tsx
```

## When to add shared UI

Add shared UI when both platforms need it or near-term reuse is concrete. Keep
route-specific layouts, branded page sections, and one-off product chrome inside
the app that owns them.

## Theme model

`packages/ui` defines the token contract. Apps provide values and brand mapping.
Use existing tokens before adding new ones.

## Generating components

Use the generator for new shared UI:

```sh
pnpm ui:gen ComponentName --component
pnpm ui:gen PrimitiveName --primitive
```

Run UI validation when changing shared UI structure:

```sh
pnpm --filter @repo/ui typecheck
pnpm ui:validate
```
