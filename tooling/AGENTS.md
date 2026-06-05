# AGENTS.md

## Scope

These instructions apply to `tooling`, the repo scripts and generators. They
supplement the root repo instructions.

`tooling` owns deterministic maintenance scripts, generated metadata inputs, and
tests for repository invariants.

---

## Generator Rules

- Generators must be deterministic: stable sorting, stable formatting, and no
  environment-dependent output unless explicitly configured.
- Provide a check mode for generated files when practical. Check mode must fail
  with a clear message when output is stale.
- Keep generated outputs small, readable, and committed only when they are
  required by runtime packages.
- Prefer updating generator inputs over hand-editing generated outputs.
- Do not make scripts mutate unrelated files.

---

## Notification Destination Metadata

- `notification-destination-config.json` is the source of truth for app
  destination ids, labels, and route mappings.
- `generate-notification-destinations.js` validates that configured destinations
  point at existing web and native routes.
- Account for every discovered route in the generator scope by mapping it as a
  destination or adding it to `ignoreRoutes`.
- Destination ids must remain stable because notifications persist them.

---

## Tests

- Add tests for scripts that enforce repo invariants or generate committed
  output.
- Keep tests focused on observable script behavior: generated content, stale
  output detection, path derivation, and validation failures.

---

## Verification

Run relevant tooling checks after changes:

```sh
pnpm notifications:verify
pnpm notifications:test
```
