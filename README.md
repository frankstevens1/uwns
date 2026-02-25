# UWNS Boilerplate

Monorepo boilerplate for building web and native apps with shared UI and provider packages.

## Workspace Layout

- `apps/web`: Next.js app
- `apps/native`: Expo / React Native app
- `packages/ui`: Shared UI primitives/components
- `packages/providers`: Shared auth/provider wiring
- `packages/lib`: Shared utility package
- `packages/types`: Shared TypeScript types
- `packages/eslint-config`: Shared ESLint presets
- `packages/typescript-config`: Shared TypeScript presets

## Prerequisites

- Node.js 18+
- pnpm 10+
- Supabase CLI
- Docker (for local Supabase)

## Install

```bash
pnpm install
```

## Environment

Copy values from `.env.example` into app env files as needed:

- `apps/web/.env.local`
- `apps/native/.env`

Use the local Supabase project URL/anon key from `supabase status` after `supabase start`.

## Run

```bash
pnpm dev
```

Run one app:

```bash
pnpm --filter web dev
pnpm --filter native dev
```

## Build and Checks

```bash
pnpm -r build
pnpm lint
pnpm check-types
```

## Supabase (Blank Baseline)

`supabase/` is intentionally reset to a boilerplate baseline:

- one baseline migration with no domain tables/policies/functions
- no-op seed file

Commands:

```bash
supabase start
supabase db reset
```

These commands should initialize/reset a clean project schema with no product-specific data model.
