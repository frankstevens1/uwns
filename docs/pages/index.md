---
title: Unified Web Native Stack
description: A practical guide to the UWNS monorepo and the documentation template included with it.
section: Start here
order: 1
---

# Unified Web Native Stack

UWNS is a Turbo monorepo for building a product across web, native, shared UI,
shared providers, a FastAPI service, and Supabase-backed data/auth. The docs
route explains the current repo and also provides the documentation pattern
that downstream products can keep when they fork or extend this stack.

## What this stack includes

- `apps/web` for the Next.js App Router web app.
- `apps/native` for the Expo app.
- `packages/ui` for shared cross-platform UI primitives and components.
- `packages/providers` for reusable client-side providers.
- `packages/lib` for stable shared client contracts and generated metadata.
- `services/api` for the FastAPI service.
- `supabase` for local Supabase config, migrations, seed data, policies, and
  realtime publication.
- `tooling` for deterministic repo generators and maintenance scripts.

## How to use these docs

Start with repo structure, then read the architecture pages for the surfaces you
plan to change. If you are using UWNS as a product template, keep this route and
replace the content with your product's onboarding, architecture, operations,
and support documentation.

## Documentation principles

The docs are Markdown-first and repo-managed. That keeps product knowledge close
to the code, makes changes reviewable in pull requests, and avoids adding a CMS
before there is a concrete editing workflow that needs one.

Docs should be useful to implementers first. Prefer concrete paths, ownership
boundaries, commands, and operational notes over broad prose.

## What to customize first

- Update public branding in the web and native apps.
- Replace landing page and demo copy with product-specific content.
- Review auth, notification, and action tracking flows before shipping.
- Replace or extend these docs so they describe your product, not just UWNS.
