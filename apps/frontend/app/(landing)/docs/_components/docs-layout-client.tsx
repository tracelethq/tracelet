"use client"

import type { DocMeta } from "@/lib/docs-mdx"
import { DocsNav } from "./docs-nav"

export function DocsLayoutClient({
  children,
  mdxDocs = [],
}: {
  children: React.ReactNode
  mdxDocs?: DocMeta[]
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-12 px-4 py-10">
      <DocsNav mdxDocs={mdxDocs} />
      <main className="min-w-0 flex-1 flex gap-12">
        {children}
      </main>
    </div>
  )
}
