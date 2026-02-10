import { getDocSlugsWithExcerpt, searchDocsFullContent } from "@/lib/docs-mdx";
import { NextResponse } from "next/server";

export type DocsPageItem = {
  slug: string[];
  href: string;
  title: string;
  /** When listing (no q): excerpt. When searching (q): snippet around match. */
  excerpt?: string;
  snippet?: string;
};

/**
 * GET /api/docs-pages
 * - No query: returns all docs with excerpt (for empty search).
 * - ?q=...: searches full content of every doc, returns matching docs with snippet around match.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (q) {
      const hits = searchDocsFullContent(q);
      const items: DocsPageItem[] = hits.map((p) => ({
        slug: p.slug,
        href: p.href,
        title: p.title,
        snippet: p.snippet,
      }));
      return NextResponse.json(items);
    }

    const pages = getDocSlugsWithExcerpt();
    const items: DocsPageItem[] = pages.map((p) => ({
      slug: p.slug,
      href: p.href,
      title: p.title,
      excerpt: p.excerpt,
    }));
    return NextResponse.json(items);
  } catch (e) {
    console.error("[api/docs-pages]", e);
    return NextResponse.json([], { status: 500 });
  }
}
