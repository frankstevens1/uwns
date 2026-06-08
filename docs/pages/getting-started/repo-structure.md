---
title: Repo structure
description: The package and app boundaries that make up the UWNS monorepo.
section: Start here
order: 2
---

# Repo structure

UWNS keeps deployable surfaces, shared packages, backend services, database
schema, and tooling in explicit top-level folders. Keep those boundaries intact
unless a product requirement clearly justifies changing them.

## Apps

`apps/web` owns the Next.js App Router web app. Web routes, layouts, shell
composition, web auth adapters, and web-only UI live there.

`apps/native` owns the Expo app. Native screens, navigation, push registration,
native tokens, and platform-specific auth wiring live there.

## Shared packages

`packages/ui` owns shared UI primitives, composed components, auth UI, and theme
tokens. Add to it only when reuse is real across surfaces.

`packages/providers` owns shared client-side state and integrations such as
auth, actions, notifications, Supabase client boundaries, and provider exports.

`packages/lib` owns stable shared DTOs, API client contracts, generated metadata,
and code that should not belong to either app.

## Backend and data

`services/api` owns FastAPI routers, services, repositories, Pydantic schemas,
Supabase auth verification, and API tests.

`supabase` owns migrations, row-level security, grants, indexes, realtime
publication, seed data, and local Supabase configuration.

## Tooling

`tooling` owns deterministic generators and maintenance scripts. Generated
files should be updated through their generator rather than hand-edited.

## Rule of thumb

Put app behavior in apps, reusable contracts in packages, service-owned writes
in services, and database ownership in migrations. Avoid creating a new shared
package until there is real reuse.
