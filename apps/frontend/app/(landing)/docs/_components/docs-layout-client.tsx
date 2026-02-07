"use client"

import { DocsNav } from "./docs-nav"

export function DocsLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-12 px-4 py-10">
      <DocsNav />
      <main className="min-w-0 flex-1 flex gap-12">
        {children}
      </main>
    </div>
  )
}
