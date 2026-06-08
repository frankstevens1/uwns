---
title: Documentation management
description: How UWNS manages docs and how downstream products should adapt it.
section: Reference
order: 30
---

# Documentation management

The docs route is backed by Markdown stored in the repo. This is intentional:
documentation should be reviewed, versioned, and shipped with the code it
describes.

## Source of truth

Use `docs/pages/**/*.md` for content and `docs/nav.json` for ordering. Each page
can define frontmatter:

```md
---
title: Page title
description: One sentence summary.
section: Reference
order: 30
---
```

The file path becomes the route. `docs/pages/index.md` renders at `/docs`, and
`docs/pages/architecture/web.md` renders at `/docs/architecture/web`.

## Search and navigation

The web app builds a search index from page titles, descriptions, headings, and
body text. The right-side "On this page" browser is generated from Markdown
headings.

Use clear `h2` and `h3` headings. Avoid deeply nested heading structures unless
the content truly needs them.

## Why not a CMS first

A CMS adds authentication, publishing, preview, migrations, authorization, and
operational concerns. Repo Markdown is simpler and better aligned with this
stack's template role.

Add a CMS or authenticated editor only when non-engineer editing becomes a real
requirement. If you add one later, keep a clear sync or publishing boundary so
the docs route does not have two competing sources of truth.

## Product adaptation

For a product built on UWNS, keep the route and replace the content. Start with:

- product overview
- setup and local development
- architecture and ownership boundaries
- operations and incident runbooks
- user-facing support docs where relevant
