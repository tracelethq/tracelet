"use client"

import * as React from "react"
import Link from "next/link"
import { ListIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type DocSectionItem = { id: string; label: string }

/** TOC entry with depth: 0 = h1, 1 = h2, 2 = h3 */
type TocEntry = { id: string; title: string; depth: number }

type DocPageTocProps = {
  className?: string
}

/** Extract headings (h1, h2, h3) with id from the article sibling of this aside. */
function extractHeadingsFromDom(asideEl: HTMLElement | null): TocEntry[] {
  if (!asideEl) return []
  const article = asideEl.previousElementSibling
  if (!article || article.tagName !== "ARTICLE") return []
  const entries: TocEntry[] = []
  const nodes = article.querySelectorAll("h1[id], h2[id], h3[id]")
  nodes.forEach((el) => {
    const id = el.getAttribute("id")
    const title = (el.textContent ?? "").trim()
    if (id && title) {
      const depth = el.tagName === "H1" ? 0 : el.tagName === "H2" ? 1 : 2
      entries.push({ id, title, depth })
    }
  })
  return entries
}

/** Top offset (e.g. header height); headings above this are not considered in view */
const VIEW_TOP_OFFSET = 120
/** Bottom margin; heading is in view if it's above (viewport height - this) */
const VIEW_BOTTOM_OFFSET = 80

function getVisibleIdsFromScroll(toc: TocEntry[]): Set<string> {
  const visible = new Set<string>()
  if (toc.length === 0) return visible
  const viewTop = VIEW_TOP_OFFSET
  const viewBottom = typeof window !== "undefined" ? window.innerHeight - VIEW_BOTTOM_OFFSET : Infinity
  for (let i = 0; i < toc.length; i++) {
    const el = document.getElementById(toc[i].id)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const top = rect.top
    const bottom = rect.bottom
    if (bottom >= viewTop && top <= viewBottom) visible.add(toc[i].id)
  }
  return visible
}

export function DocPageToc({ className }: DocPageTocProps) {
  const [toc, setToc] = React.useState<TocEntry[]>([])
  const [visibleIds, setVisibleIds] = React.useState<Set<string>>(new Set())
  const [lastInViewId, setLastInViewId] = React.useState<string | null>(null)
  const asideRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const run = () => {
      const next = extractHeadingsFromDom(asideRef.current)
      if (next.length > 0) setToc(next)
    }
    run()
    const t = requestAnimationFrame(run)
    return () => cancelAnimationFrame(t)
  }, [])

  // Scroll-based: collect all heading ids that are currently in view; keep last when none
  React.useEffect(() => {
    if (toc.length === 0) return
    const update = () => {
      const next = getVisibleIdsFromScroll(toc)
      if (next.size > 0) {
        const lastId = toc.filter((t) => next.has(t.id)).pop()?.id ?? null
        setLastInViewId(lastId)
      }
      setVisibleIds(next)
    }
    update()
    let rafId: number
    const onScroll = () => {
      if (rafId != null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", update)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [toc])

  return (
    <aside
      ref={asideRef}
      className={cn(
        "min-w-52 w-52 shrink-0 pl-6",
        className
      )}
      aria-label="On this page"
    >
      <nav className="sticky top-20 max-h-[calc(100svh-var(--landing-nav-height)-2.5rem)] overflow-auto no-scrollbar">
        <div className="mb-3 flex items-center gap-2">
          <ListIcon className="size-4 text-muted-foreground" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            On this page
          </p>
        </div>
        {toc.length > 0 ? (
          <ul className="space-y-0.5">
            {toc.map(({ id, title, depth }) => {
              const effectiveVisible =
                visibleIds.size > 0
                  ? visibleIds
                  : lastInViewId
                    ? new Set([lastInViewId])
                    : new Set<string>()
              const isInView = effectiveVisible.has(id)
              return (
                <li
                  key={id}
                  className={cn(
                    "relative",
                    depth === 1 && "pl-4",
                    depth === 2 && "pl-8"
                  )}
                >
                  <Link
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(id)?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }}
                    className={cn(
                      "block rounded-md py-1.5 text-sm transition-colors hover:text-foreground",
                      isInView
                        ? "font-medium text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {title}
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No sections</p>
        )}
      </nav>
    </aside>
  )
}
