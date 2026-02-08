"use client"

import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"

export type DocSectionItem = { id: string; label: string }

type DocsSidebarProps = {
  title: string
  sections: DocSectionItem[]
  backHref?: string
  backLabel?: string
}

export function DocsSidebar({
  title,
  sections,
  backHref = "/docs",
  backLabel = "Docs",
}: DocsSidebarProps) {
  return (
    <aside className="w-56 shrink-0 border-r border-border pr-6">
      <nav className="sticky top-20 space-y-4">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeftIcon className="size-4" />
            {backLabel}
          </Link>
        )}
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <ul className="space-y-1">
          {sections.map(({ id, label }) => (
            <li key={id}>
              <Link
                href={`#${id}`}
                className="block rounded-md py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
