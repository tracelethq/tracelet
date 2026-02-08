/**
 * App-wide constants, links, and config.
 * Manage all URLs, routes, and shared values here.
 */

// ─── External links ───────────────────────────────────────────────────────

export const LINKS = {
  /** Tracelet GitHub repository */
  github: "https://github.com/tracelethq/tracelet",
} as const

// ─── App routes ───────────────────────────────────────────────────────────

export const ROUTES = {
  home: "/",
  docs: "/docs",
  docsUsing: "/docs/using",
  docsUsingExpress: "/docs/using/express",
  docsUsingCore: "/docs/using/core",
  docsContributing: "/docs/contributing",
} as const

// ─── Landing page ─────────────────────────────────────────────────────────

/** Section and typography classes for landing sections */
export const LANDING = {
  sectionClass:
    "mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24",
  sectionClassAlt:
    "mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24 bg-muted/20 dark:bg-muted/10",
  /** Small label above headings (e.g. "What we do") */
  sectionLabelClass:
    "text-xs font-medium uppercase tracking-widest text-primary/80 dark:text-primary/90",
  headingClass:
    "text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
  subheadingClass:
    "mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl",
} as const

// ─── Docs ─────────────────────────────────────────────────────────────────

/** Default SDK route when redirecting from /docs/using */
export const DOCS_DEFAULT_SDK_ROUTE = ROUTES.docsUsingExpress
