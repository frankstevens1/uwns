# AGENTS.md

## Scope

These instructions apply to `supabase`, including migrations, seed data, local
config, and snippets. They supplement the root repo instructions.

`supabase` owns source-controlled database schema, RLS, grants, indexes,
realtime publication, and local bootstrap data.

---

## Migration Rules

- Put schema changes in timestamped files under `migrations/`.
- Migrations must be explicit and reviewable. Do not rely on dashboard-only
  schema changes.
- Add tables, constraints, indexes, grants, RLS enablement, and policies in the
  same migration when they are part of one feature.
- Prefer normalized PostgreSQL-centric design. Use JSONB only for intentionally
  flexible metadata or target payloads.
- Add indexes for user-scoped list queries, unique keys, foreign keys used in
  lookups, and realtime-driven access patterns.

---

## RLS And Grants

- Enable RLS on product tables.
- Revoke broad client access before granting intentional roles.
- Prefer the current service-owned write model:
  authenticated clients may read their own product records, while service role
  performs inserts, updates, deletes, delivery attempts, and private token writes.
- User-readable tables need policies scoped to `(select auth.uid()) = user_id`.
- Private operational tables such as push tokens and delivery attempts should not
  be readable by clients unless a product requirement explicitly needs it.
- Do not bury critical authorization logic in client code.

---

## Realtime And Generated Metadata

- Add tables to `supabase_realtime` only when clients subscribe to them.
- Keep realtime publication aligned with provider subscriptions in
  `packages/providers`.
- Notification `app_destination` target ids must exist in generated destination
  metadata. Update tooling config and regenerate metadata when routes change.

---

## Verification

For schema changes, run the narrowest local Supabase verification available:

```sh
supabase db reset
pnpm api:test
pnpm notifications:verify
```

If a migration changes API payloads or provider subscriptions, also run the
affected TypeScript checks.
