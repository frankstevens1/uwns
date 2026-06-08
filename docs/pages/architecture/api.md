---
title: API service
description: The FastAPI service boundary and when product work belongs there.
section: Architecture
order: 14
---

# API service

The API lives in `services/api` and uses FastAPI. It owns service-side
validation, authenticated product operations, delivery side effects, repositories,
Pydantic schemas, and API tests.

## What belongs in the API

Put operations in the API when they require service-owned writes, server-side
validation, delivery side effects, deduplication, or trusted auth checks.

Do not bury critical authorization behavior in scattered client code. The client
can start the action; the service should own trusted writes.

## Shape

Keep boundaries clear:

- router for HTTP shape
- schema for request and response validation
- service for product logic
- repository for data access
- test for critical behavior and regressions

Avoid service layers that only forward calls without adding value.

## Verification

For API changes, run:

```sh
pnpm api:test
```
