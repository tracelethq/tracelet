import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { serialize } from "next-mdx-remote/serialize"
import type { MDXRemoteSerializeResult } from "next-mdx-remote"
import remarkGfm from "remark-gfm"

const CONTENT_DIR = path.join(process.cwd(), "content", "docs")

export type DocSectionItem = { id: string; label: string }

export type DocFrontmatter = {
  title?: string
  description?: string
  /** Optional TOC sections (id + label). If omitted, no on-this-page TOC is shown. */
  sections?: DocSectionItem[]
}

export type DocMeta = {
  slug: string[]
  href: string
  title: string
}

/**
 * Recursively list all .mdx files under content/docs and return slug + title from frontmatter.
 */
export function getDocSlugs(): DocMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  const items: DocMeta[] = []

  function walk(dir: string, prefix: string[] = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of entries) {
      const rel = [...prefix, e.name]
      if (e.isDirectory()) {
        walk(path.join(dir, e.name), rel)
      } else if (e.isFile() && e.name.endsWith(".mdx")) {
        const baseSlug = e.name.replace(/\.mdx$/, "")
        const slug = baseSlug === "index" && prefix.length === 0 ? [] : [...prefix, baseSlug]
        const href = slug.length === 0 ? "/docs" : "/docs/" + slug.join("/")
        const fullPath = path.join(dir, e.name)
        const raw = fs.readFileSync(fullPath, "utf-8")
        const { data } = matter(raw)
        const title = (data?.title as string) || (slug[slug.length - 1] ?? "Docs").replace(/-/g, " ")
        items.push({
          slug,
          href,
          title: title.charAt(0).toUpperCase() + title.slice(1),
        })
      }
    }
  }

  walk(CONTENT_DIR)
  return items.sort((a, b) => a.href.localeCompare(b.href))
}

/**
 * Load one doc by slug (e.g. ['contributing'], ['using','express'], or [] for index).
 * Returns frontmatter + serialized MDX content for use in page.
 */
export async function getDocBySlug(slug: string[]): Promise<{
  frontmatter: DocFrontmatter
  source: MDXRemoteSerializeResult
} | null> {
  const filePath =
    slug.length === 0
      ? path.join(CONTENT_DIR, "index.mdx")
      : path.join(CONTENT_DIR, ...slug) + ".mdx"
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)
  const frontmatter = data as DocFrontmatter
  const source = await serialize(content, {
    parseFrontmatter: false,
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    },
  })
  return { frontmatter, source }
}

/**
 * Check if an MDX file exists for the given slug. Use [] for docs index (index.mdx).
 */
export function hasDoc(slug: string[]): boolean {
  const filePath =
    slug.length === 0
      ? path.join(CONTENT_DIR, "index.mdx")
      : path.join(CONTENT_DIR, ...slug) + ".mdx"
  return fs.existsSync(filePath)
}
