# UWNS Documentation Source

The public `/docs` route is generated from the Markdown files in this directory.
For products built from UWNS, this directory is the intended documentation
template: keep documentation in version control, review changes in pull
requests, and let the web app render the current state.

## Structure

- `nav.json` controls the visible documentation order.
- `pages/index.md` renders at `/docs`.
- `pages/**/*.md` renders at `/docs/**` based on its file path.
- Markdown frontmatter supplies page metadata.

Use this frontmatter for new pages:

```md
---
title: Page title
description: One sentence summary for navigation, search, and metadata.
section: Section name
order: 10
---
```

## Management Model

Markdown in the repo is the source of truth. This keeps documentation aligned
with code, migrations, scripts, and product conventions. A CMS or in-app editor
can be added later, but it should write through a controlled workflow rather
than becoming a hidden source of truth.

When adapting UWNS for a product:

1. Keep `docs/nav.json` small and intentional.
2. Replace UWNS-specific pages with product-specific pages.
3. Keep architecture and operations docs close to the code they describe.
4. Treat docs changes like product changes: reviewed, tested, and shipped.
