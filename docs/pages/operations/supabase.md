---
title: Supabase
description: Database, auth, migrations, and row-level security ownership.
section: Operations
order: 20
---

# Supabase

Supabase is the default database and auth platform for UWNS. Treat it as
infrastructure: schema, policies, grants, indexes, realtime publication, and
seed data belong in source-controlled migrations and config.

## Migrations

Use migrations for schema changes. Do not rely on dashboard-only changes for
behavior that the product needs to reproduce.

## Row-level security

Use RLS deliberately. Policies should be easy to reason about and should not
depend on scattered client checks for safety.

## Auth

Supabase Auth handles account identity and session issuance. Apps hold platform
session state; the API verifies bearer tokens before trusted writes.

## Local reset

When a migration or seed change needs verification, use the repo's Supabase
workflow:

```sh
supabase db reset
```

Run focused app, API, or notification checks after database changes.
