import type { TraceletMeta, FlattenedRoute } from "./types";

function joinPath(parent: string, child: string): string {
  const p = parent.replace(/\/+$/, "") || "/";
  const c = child.replace(/^\/+/, "") || "";
  return c ? `${p}/${c}` : p;
}

/**
 * Flatten a tree of TraceletMeta into an array of routes with full paths.
 */
export function flattenRoutes(routes: TraceletMeta[], parentPath = ""): FlattenedRoute[] {
  const result: FlattenedRoute[] = [];
  for (const r of routes) {
    const fullPath = parentPath ? joinPath(parentPath, r.path) : (r.path.startsWith("/") ? r.path : `/${r.path}`);
    // Skip PARENT-only nodes (grouping); include if they have other metadata
    if (r.method !== "PARENT") {
      result.push({
        method: r.method,
        path: r.path,
        fullPath,
        description: r.description,
        request: r.request,
        responses: r.responses,
        query: r.query,
        params: r.params,
        tags: r.tags,
        requestContentType: r.requestContentType,
      });
    }
    if (r.routes?.length) {
      result.push(...flattenRoutes(r.routes, fullPath));
    }
  }
  return result;
}
