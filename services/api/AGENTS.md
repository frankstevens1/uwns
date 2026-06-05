# AGENTS.md

## Scope

These instructions apply to `services/api`, the FastAPI service. They supplement
the root repo instructions.

`services/api` owns authenticated product API endpoints, server-side validation,
business workflows, notification delivery side effects, and service-owned
Supabase writes.

---

## Service Structure

- Keep route registration in `app/main.py`.
- Each feature should follow the current shape:

```txt
app/services/example/
  models.py
  router.py
  repository.py
  service.py
```

- Routers own HTTP concerns: dependencies, auth, status codes, and request
  wiring.
- Services own business behavior and coordination between repositories,
  delivery providers, and consumers.
- Repositories own Supabase REST table access and row-to-model conversion.
- Avoid pass-through service layers that add no behavior.

---

## Auth And Data Access

- Client calls authenticate with the current Supabase access token:
  `Authorization: Bearer <supabase_access_token>`.
- Use `get_current_user` for user identity. Do not trust user ids from request
  bodies.
- The API uses Supabase secret/service credentials for service-owned writes.
- Keep authorization easy to inspect: user-scoped operations must filter by the
  authenticated `user_id`.
- Do not move RLS or grant logic into Python. Put database authorization in
  `supabase` migrations.

---

## Models And Contracts

- Use Pydantic models for request and response boundaries.
- Keep validators explicit for persisted identifiers, notification targets,
  platforms, channels, and unique keys.
- Preserve compatibility with `@repo/lib` client payload mappings when endpoint
  shapes change.
- Keep metadata as structured JSON with low-cardinality keys where practical.

---

## Notifications And Actions

- Actions represent meaningful user intent or completed outcomes.
- Notification side effects should be triggered through explicit service
  consumers or service methods, not hidden repository behavior.
- Record delivery attempts for sent, skipped, and failed email/push deliveries so
  delivery behavior remains inspectable.
- Keep idempotency where unique keys exist; repeated requests should return or
  update the existing product record when that is the established behavior.

---

## Verification

Run API tests after API behavior changes:

```sh
pnpm api:test
```

Also run app/provider/lib checks when API contracts change.
