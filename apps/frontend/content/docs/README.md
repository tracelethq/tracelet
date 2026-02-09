# Docs content (MDX)

All docs are MDX. Add an `.mdx` file here to create a new doc page.

- **`index.mdx`** → `/docs` (docs home)
- **`foo.mdx`** → `/docs/foo`
- **`using/express.mdx`** → `/docs/using/express`

Use frontmatter for title, description, and optional "On this page" sections:

```yaml
---
title: Your page title
description: Short description shown under the heading
sections:
  - id: section-id
    label: Section label
---
```

Use standard Markdown and fenced code blocks. For doc landing pages with cards, use `<DocCardGrid>` and `<DocCard href="..." title="..." description="..." icon="code|book|express|box" />`. New pages appear in the sidebar automatically (except `index.mdx` and `using.mdx`, which are linked from the fixed nav).
