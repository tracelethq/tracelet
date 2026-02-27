import fs from "fs";
import path from "path";

/** Supported HTTP methods for route metadata */
export type TraceletHttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "PARENT";

/**
 * Definition of a single request/response property.
 */
export interface TraceletProperty {
  name: string;
  type: string;
  desc?: string;
  required?: boolean;
  enum?: readonly string[];
  accept?: string;
  maxFiles?: number;
}

export interface TraceletResponseProperty {
  status: number;
  description?: string;
  properties: TraceletProperty[];
}

/** Preferred request body content type for the Try-it UI. */
export type RequestContentType = "application/json" | "multipart/form-data";

/**
 * Metadata for a single API route, used by Tracelet doc UI and tooling.
 * Routes can be nested via `routes`; child paths are resolved relative to the parent path.
 */
export interface TraceletMeta {
  description?: string;
  method: TraceletHttpMethod;
  path: string;
  requestContentType?: RequestContentType;
  request?: TraceletProperty[];
  responses?: TraceletResponseProperty[];
  query?: TraceletProperty[];
  params?: TraceletProperty[];
  tags?: readonly string[];
  routes?: TraceletMeta[];
  groupKey?: string;
}

export const DEFAULT_DOC_FILE = "tracelet.doc.json";

function normalizePath(p: string): string {
  return p.startsWith("/") ? p : `/${p}`;
}

function routeKey(r: TraceletMeta): string {
  return `${r.method}:${normalizePath(r.path)}`;
}

function joinPath(parent: string, child: string): string {
  const p = parent.replace(/\/+$/, "") || "/";
  const c = child.replace(/^\/+/, "") || "";
  return c ? `${p}/${c}` : p;
}

export interface RouteMetaOptions {
  /** Default filename for doc JSON when path not provided (default `tracelet.doc.json`). */
  defaultDocFile?: string;
  /** Meta to use instead of reading from file. */
  meta?: TraceletMeta[] | null;
}

/**
 * Handles loading, merging, and resolving route metadata for Tracelet docs.
 * Framework SDKs use this class instead of implementing meta logic.
 */
export class RouteMeta {
  readonly defaultDocFile: string;
  readonly meta?: TraceletMeta[] | null;
  constructor(options: RouteMetaOptions) {
    this.defaultDocFile = options.defaultDocFile ?? DEFAULT_DOC_FILE;
    this.meta = options.meta ?? null;
  }

  /** Read TraceletMeta[] from a JSON file. Returns null if file missing or invalid. */
  readFromFile(): TraceletMeta[] | null {
    const filePath = this.defaultDocFile;
    const resolved = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    try {
      if (!fs.existsSync(resolved)) return null;
      const raw = fs.readFileSync(resolved, "utf-8");
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return null;
      return data as TraceletMeta[];
    } catch {
      return null;
    }
  }

  /** Merge file meta with param meta. Keyed by method+path; param meta wins. */
  merge(fileMeta: TraceletMeta[], paramMeta: TraceletMeta[]): TraceletMeta[] {
    const byKey = new Map<string, TraceletMeta>();
    for (const r of fileMeta) byKey.set(routeKey(r), { ...r });
    for (const r of paramMeta) byKey.set(routeKey(r), { ...r });
    return Array.from(byKey.values());
  }

  /** Resolve full paths in the tree; keep nested structure. */
  resolveTree(routes: TraceletMeta[], parentPath = ""): TraceletMeta[] {
    return routes.map((r) => {
      const fullPath = parentPath ? joinPath(parentPath, r.path) : r.path;
      const { routes: children, ...rest } = r;
      const resolved: TraceletMeta = { ...rest, path: fullPath };
      if (children?.length) {
        resolved.routes = this.resolveTree(children, fullPath);
      }
      return resolved;
    });
  }

  /**
   * Load meta from file, merge with param meta, and return merged list.
   * Use resolveTree() when you need full paths for the docs JSON response.
   */
  loadAndMerge(): TraceletMeta[] {
    const fileMeta = this.readFromFile();
    const merged = this.merge(fileMeta ?? [], this.meta ?? []);
    const resolved = this.resolveTree(merged);
    return resolved;
  }
}
