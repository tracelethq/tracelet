"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

export type DocSectionItem = { id: string; label: string }

type DocPageTocProps = {
  sections: DocSectionItem[]
  className?: string
}

export function DocPageToc({ sections, className }: DocPageTocProps) {
  return (
    <aside
      className={cn(
        "w-52 shrink-0 border-l border-border pl-6",
        className
      )}
    >
      <nav className="sticky top-20 space-y-1">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          On this page
        </p>
        <ul className="space-y-0.5">
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
