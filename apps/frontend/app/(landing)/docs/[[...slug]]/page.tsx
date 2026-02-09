import { notFound } from "next/navigation"
import { getDocBySlug, getDocSlugs, hasDoc } from "@/lib/docs-mdx"
import { DocPageToc } from "../_components/doc-page-toc"
import { MdxRenderer } from "../_components/mdx-renderer"

type PageProps = {
  params: Promise<{ slug?: string[] }>
}

export function generateStaticParams() {
  const docs = getDocSlugs()
  const params = docs.map((d) => ({ slug: d.slug }))
  if (hasDoc([])) params.push({ slug: [] })
  return params
}

export default async function DocMdxPage({ params }: PageProps) {
  const { slug } = await params
  const slugArray = slug ?? []
  if (!hasDoc(slugArray)) notFound()

  const doc = await getDocBySlug(slugArray)
  if (!doc) notFound()

  const { frontmatter, source } = doc
  const title =
    frontmatter.title ??
    (slugArray.length > 0 ? slugArray[slugArray.length - 1] : "Documentation") ??
    "Docs"
  const description = frontmatter.description
  const sections = frontmatter.sections ?? []

  return (
    <div className="flex w-full min-w-0 gap-8">
      <article className="min-w-0 flex-1">
        <div className="space-y-12">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-muted-foreground">{description}</p>
            )}
          </div>
          <MdxRenderer source={source} />
        </div>
      </article>
      {sections.length > 0 ? (
        <DocPageToc sections={sections} className="min-w-52 shrink-0" />
      ) : null}
    </div>
  )
}
