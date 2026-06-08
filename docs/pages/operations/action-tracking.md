---
title: Action tracking
description: When and how to record meaningful product actions.
section: Operations
order: 21
---

# Action tracking

UWNS includes action tracking for meaningful authenticated product events. Use it
for user intent, completed outcomes, and first entry into authenticated product
screens.

## What to track

Track high-signal actions such as sign-in, sign-out, settings views, account
views, notification interactions, and product workflow milestones.

Skip passive noise, scroll logging, and pre-auth page views that cannot be tied
to a recorded user session.

## Metadata

Keep metadata structured and low-cardinality. Prefer fields such as `source`,
`screen`, and `trigger`, plus the minimum context needed to interpret the event.

Use stable `uniqueKey` values for first-view events so re-renders and route
revisits do not duplicate records.

## Placement

Track client-side where the user action originates. Add API-side tracking only
when the server is the only meaningful source of the action.

When adding a user-facing interaction, decide tracking in the same diff.
