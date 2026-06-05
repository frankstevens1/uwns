# UWNS API Service

Lightweight FastAPI backend for product data services.

## Run

```bash
pnpm api:dev
```

## Test

```bash
pnpm api:test
```

## Environment

Store service-only environment in `services/api/.env`:

```bash
cp services/api/.env.example services/api/.env
```

`pnpm api:dev` runs uvicorn with `--env-file .env` from inside
`services/api`, so the service reads that local file before importing the app.

For local Supabase, use the `Secret` value from `supabase status` as
`SUPABASE_SECRET_KEY`. This repo uses Supabase's newer publishable/secret key
model, so the service does not require a legacy service-role key or JWT secret.

Web/native clients track actions with the current Supabase access token:

```http
Authorization: Bearer <supabase_access_token>
```

```http
POST /v1/actions
```
