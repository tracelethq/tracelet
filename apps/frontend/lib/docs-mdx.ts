import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import remarkGfm from "remark-gfm";
import { BookOpenIcon, BoxIcon, Code2Icon, FileTextIcon, FlaskConicalIcon, LampDesk } from "lucide-react";
import { ExpressIcon } from "@/components/icons/express-icon";

const CONTENT_DIR = path.join(process.cwd(), "content", "docs");

export type DocSectionItem = { id: string; label: string };

export type DocFrontmatter = {
  title?: string;
  description?: string;
  /** Optional sort order (lower = first in nav). Use to put e.g. Introduction first. */
  order?: number;
  /** Optional icon for nav sidebar: book, code, file, flask, express, box. */
  icon?: string;
  /** Optional TOC sections (id + label). If omitted, no on-this-page TOC is shown. */
  sections?: DocSectionItem[];
};

export type DocMeta = {
  slug: string[];
  href: string;
  title: string;
  /** Sort order from frontmatter (undefined = after all ordered docs). */
  order?: number;
  /** Icon from frontmatter (used in docs nav). */
  icon?: string;
};

export type DocMetaWithExcerpt = DocMeta & {
  /** Plain-text excerpt from frontmatter description or content body for search and preview. */
  excerpt: string;
};

const EXCERPT_MAX_LENGTH = 320;

/**
 * Strip markdown to plain text (rough): remove code blocks, links, bold, etc.
 */
function toPlainExcerpt(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#+\s+/gm, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strip JSX/MDX component usage so we're left with the text that would be visible
 * when rendered (prose and text between/outside components). Removes component tags
 * but keeps the text content inside them.
 */
function stripJsxToRenderedText(md: string): string {
  let out = md
    // Self-closing JSX: <Component ... /> or <Component />
    .replace(/<[A-Za-z][A-Za-z0-9.-]*(?:\s[^>]*)?\/\s*>/g, " ")
    // Opening JSX/HTML tags: <Tag ...> (keep content after for now)
    .replace(/<[A-Za-z][A-Za-z0-9.-]*(?:\s[^>]*)?>/g, " ")
    // Closing tags: </Tag>
    .replace(/<\/[A-Za-z][A-Za-z0-9.-]*>/g, " ");
  return out.replace(/\s+/g, " ").trim();
}

/**
 * Convert raw MDX content to plain text that approximates what the user sees when
 * the doc is rendered: strip JSX/component usage first, then markdown.
 */
function toRenderedLikeText(md: string): string {
  return toPlainExcerpt(stripJsxToRenderedText(md));
}

/**
 * Recursively list all .mdx files under content/docs and return slug + title from frontmatter.
 */
export function getDocSlugs(): DocMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const items: DocMeta[] = [];

  function walk(dir: string, prefix: string[] = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const rel = [...prefix, e.name];
      if (e.isDirectory()) {
        walk(path.join(dir, e.name), rel);
      } else if (e.isFile() && e.name.endsWith(".mdx")) {
        const baseSlug = e.name.replace(/\.mdx$/, "");
        const slug =
          baseSlug === "index" && prefix.length === 0
            ? []
            : [...prefix, baseSlug];
        const href = slug.length === 0 ? "/docs" : "/docs/" + slug.join("/");
        const fullPath = path.join(dir, e.name);
        const raw = fs.readFileSync(fullPath, "utf-8");
        const { data } = matter(raw);
        const title =
          (data?.title as string) ||
          (slug[slug.length - 1] ?? "Docs").replace(/-/g, " ");
        const order = data?.order != null ? Number(data.order) : undefined;
        const icon = (data as DocFrontmatter)?.icon;
        const validIcon = icon;
        items.push({
          slug,
          href,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          ...(typeof order === "number" && !Number.isNaN(order)
            ? { order }
            : {}),
          ...(validIcon ? { icon: validIcon } : {}),
        });
      }
    }
  }

  walk(CONTENT_DIR);
  return items.sort((a, b) => {
    const oA = a.order ?? 999;
    const oB = b.order ?? 999;
    if (oA !== oB) return oA - oB;
    return a.href.localeCompare(b.href);
  });
}

/**
 * Like getDocSlugs but includes a searchable excerpt from frontmatter description or content body.
 */
export function getDocSlugsWithExcerpt(): DocMetaWithExcerpt[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const items: DocMetaWithExcerpt[] = [];

  function walk(dir: string, prefix: string[] = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const rel = [...prefix, e.name];
      if (e.isDirectory()) {
        walk(path.join(dir, e.name), rel);
      } else if (e.isFile() && e.name.endsWith(".mdx")) {
        const baseSlug = e.name.replace(/\.mdx$/, "");
        const slug =
          baseSlug === "index" && prefix.length === 0
            ? []
            : [...prefix, baseSlug];
        const href = slug.length === 0 ? "/docs" : "/docs/" + slug.join("/");
        const fullPath = path.join(dir, e.name);
        const raw = fs.readFileSync(fullPath, "utf-8");
        const { data, content } = matter(raw);
        const title =
          (data?.title as string) ||
          (slug[slug.length - 1] ?? "Docs").replace(/-/g, " ");
        const desc = (data as DocFrontmatter)?.description;
        const contentPlain = toRenderedLikeText(content);
        const excerptSource = desc?.trim() || contentPlain;
        const excerpt =
          excerptSource.length <= EXCERPT_MAX_LENGTH
            ? excerptSource
            : excerptSource.slice(0, EXCERPT_MAX_LENGTH).trim() + "…";

        const order = (data as DocFrontmatter)?.order;
        const orderNum = order != null ? Number(order) : undefined;
        const icon = (data as DocFrontmatter)?.icon;
        const validIcon = icon;
        items.push({
          slug,
          href,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          excerpt: excerpt || title,
          ...(typeof orderNum === "number" && !Number.isNaN(orderNum)
            ? { order: orderNum }
            : {}),
          ...(validIcon ? { icon: validIcon } : {}),
        });
      }
    }
  }

  walk(CONTENT_DIR);
  return items.sort((a, b) => {
    const oA = a.order ?? 999;
    const oB = b.order ?? 999;
    if (oA !== oB) return oA - oB;
    return a.href.localeCompare(b.href);
  });
}

/**
 * Load one doc by slug (e.g. ['contributing'], ['using','express'], or [] for index).
 * Returns frontmatter + serialized MDX content for use in page.
 */
export async function getDocBySlug(slug: string[]): Promise<{
  frontmatter: DocFrontmatter;
  source: MDXRemoteSerializeResult;
} | null> {
  const filePath =
    slug.length === 0
      ? path.join(CONTENT_DIR, "index.mdx")
      : path.join(CONTENT_DIR, ...slug) + ".mdx";
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = data as DocFrontmatter;
  const source = await serialize(content, {
    parseFrontmatter: false,
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    },
  });
  return { frontmatter, source };
}

/**
 * Check if an MDX file exists for the given slug. Use [] for docs index (index.mdx).
 */
export function hasDoc(slug: string[]): boolean {
  const filePath =
    slug.length === 0
      ? path.join(CONTENT_DIR, "index.mdx")
      : path.join(CONTENT_DIR, ...slug) + ".mdx";
  return fs.existsSync(filePath);
}

export type DocSearchHit = {
  slug: string[];
  href: string;
  title: string;
  /** Snippet of full content around the first match (plain text). */
  snippet: string;
};

const SEARCH_SNIPPET_LENGTH = 120;

/**
 * Search through the full content of all docs (not just excerpt). Returns matching docs
 * with a snippet of text around the first match.
 */
export function searchDocsFullContent(query: string): DocSearchHit[] {
  if (!query.trim() || !fs.existsSync(CONTENT_DIR)) return [];
  const q = query.trim().toLowerCase();
  const hits: DocSearchHit[] = [];

  function walk(dir: string, prefix: string[] = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const rel = [...prefix, e.name];
      if (e.isDirectory()) {
        walk(path.join(dir, e.name), rel);
      } else if (e.isFile() && e.name.endsWith(".mdx")) {
        const baseSlug = e.name.replace(/\.mdx$/, "");
        const slug =
          baseSlug === "index" && prefix.length === 0
            ? []
            : [...prefix, baseSlug];
        const href = slug.length === 0 ? "/docs" : "/docs/" + slug.join("/");
        const fullPath = path.join(dir, e.name);
        const raw = fs.readFileSync(fullPath, "utf-8");
        const { data, content } = matter(raw);
        const title =
          (data?.title as string) ||
          (slug[slug.length - 1] ?? "Docs").replace(/-/g, " ");
        const contentPlain = toRenderedLikeText(content);
        const idx = contentPlain.toLowerCase().indexOf(q);
        if (idx === -1) return;
        const half = Math.floor((SEARCH_SNIPPET_LENGTH - q.length) / 2);
        const start = Math.max(0, idx - half);
        const end = Math.min(
          contentPlain.length,
          start + SEARCH_SNIPPET_LENGTH,
        );
        let snippet = contentPlain.slice(start, end).trim();
        if (start > 0) snippet = "…" + snippet;
        if (end < contentPlain.length) snippet = snippet + "…";
        hits.push({
          slug,
          href,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          snippet,
        });
      }
    }
  }

  walk(CONTENT_DIR);
  return hits.sort((a, b) => a.href.localeCompare(b.href));
}