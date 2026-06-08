---
title: Web app
description: How the Next.js App Router surface is organized in UWNS.
section: Architecture
order: 10
---

# Web app

The web app lives in `apps/web` and uses Next.js App Router with TypeScript and
Tailwind. It owns browser routes, web layouts, web auth adapters, public chrome,
authenticated app chrome, and web-specific product behavior.

## Route model

Public routes use the marketing shell. Authenticated product routes live under
`/app` and use the app shell. The root shell chooses the correct chrome from the
current pathname.

Keep route-specific UI close to its route. Move code into shared packages only
when reuse is real and the contract is stable.

## Server-first defaults

Prefer server components for pages and static data. Use client components for
browser APIs, hooks, interaction state, providers, and action tracking.

Keep SSR Supabase logic and cookie/session behavior inside `apps/web`; shared
providers are for client-side behavior.

## Styling

Use Tailwind with the existing UI token variables. Prefer canonical variable
utilities such as `bg-(--ui-bg)`, `text-(--ui-fg)`, and `border-(--ui-border)`.

## Verification

For web-only changes, run:

```sh
pnpm --filter web check-types
```

Run provider, UI, API, or notification checks when a change crosses those
boundaries.
