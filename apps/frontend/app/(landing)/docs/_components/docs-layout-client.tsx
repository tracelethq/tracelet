"use client"

import type { DocMeta } from "@/lib/docs-mdx"
import { DocsNav } from "./docs-nav"
import Decorations from "@/components/ui/decorations"

export function DocsLayoutClient({
  children,
  mdxDocs = [],
}: {
  children: React.ReactNode
  mdxDocs?: DocMeta[]
}) {
  return (
    <div className="flex w-full border relative min-h-[calc(100svh-var(--landing-nav-height))]">
      <Decorations />
      <aside className="sticky top-[3.7rem] min-w-56 w-56 shrink-0 pr-6 pt-8 pl-4 h-[calc(100svh-var(--landing-nav-height))] overflow-visible border-r hidden md:block">
        <Decorations />
        <DocsNav mdxDocs={mdxDocs} />
      </aside>
      <main className="min-w-0 flex-1 flex gap-12 relative px-2 md:pl-12">
        <Decorations />
        {children}
      </main>
    </div>
  )
}
