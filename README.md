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
- `services/api`: FastAPI backend for lightweight Python data services

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
pnpm api:dev
```

## Build and Checks

```bash
pnpm -r build
pnpm lint
pnpm check-types
```

## Supabase

`supabase/` contains source-controlled app schema:

- one boilerplate baseline migration
- one activity events migration for the FastAPI service demo
- no-op seed file

Commands:

```bash
supabase start
supabase db reset
```

These commands should initialize/reset the local app schema.

## Python Data Services

`services/api` demonstrates the repo pattern for Python-backed product services. The Activity service accepts authenticated app events from web/native and stores them in Supabase.

Configure:

```bash
cp .env.example apps/web/.env.local
cp .env.example apps/native/.env
cp services/api/.env.example services/api/.env
```

The root `.env.example` contains app-exposed values for web/native. The
service-local `services/api/.env.example` is the source of truth for FastAPI
service secrets and CORS config.

Run:

```bash
pnpm api:dev
```
