import { getDocSlugs } from "@/lib/docs-mdx"
import { DocsLayoutClient } from "./_components/docs-layout-client"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let mdxDocs: { slug: string[]; href: string; title: string }[] = []
  try {
    mdxDocs = getDocSlugs()
  } catch {
    // content dir may be missing at build time
  }
  return <DocsLayoutClient mdxDocs={mdxDocs}>{children}</DocsLayoutClient>
}
