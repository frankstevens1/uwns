---
title: Product customization
description: The safest order for turning UWNS into a product-specific stack.
section: Start here
order: 3
---

# Product customization

Treat UWNS as a working product foundation, not a code sample. Customize the
visible product first, then adjust deeper architecture only where the product
requires it.

## Replace product identity

Update app names, metadata, public copy, legal content, icons, environment
variables, and store-facing labels. Keep branding changes at app boundaries and
theme token overrides instead of hard-coding brand colors inside shared UI.

## Shape the product surface

Replace the public landing page and authenticated `/app` screens with real
product workflows. Keep route-specific behavior near the route until reuse is
concrete.

## Review auth and data ownership

Supabase Auth is already the default account system. Before shipping, review
which tables are user-owned, which writes require the API, and which flows need
server-side validation or side effects.

## Keep documentation current

Use `docs/pages` for product docs and `docs/nav.json` for ordering. Keep
architecture, operations, and support docs in the repo so product behavior and
documentation move together.

## Avoid early rewrites

Do not replace the monorepo, provider model, or shared UI structure just to match
personal preference. Change boundaries when the current design becomes leaky for
a real requirement.
