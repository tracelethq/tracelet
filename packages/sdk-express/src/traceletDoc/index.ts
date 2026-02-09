import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { createRequire } from "module";
import { TraceletMeta } from "../types";
import fs from "fs";
import path from "path";

const requireResolve = createRequire(path.join(__dirname, "index.js"));

/** Options for the tracelet docs UI. */
export interface TraceletDocOptions {
  /** Mount path for the docs UI. Must match Vite base in tracelet-ui (default `/tracelet-docs/`). */
  path?: string;
  /** Path to the built UI (directory containing index.html and assets). Defaults to monorepo path when not set. */
  uiPath?: string;
  /** Path to JSON file for route meta (e.g. tracelet.doc.json). Defaults to `tracelet.doc.json` in process.cwd(). */
  docFilePath?: string;
}

const DEFAULT_DOC_FILE = "tracelet.doc.json";

function normalizePath(p: string): string {
  return p.startsWith("/") ? p : `/${p}`;
}

function routeKey(r: TraceletMeta): string {
  return `${r.method}:${normalizePath(r.path)}`;
}

/** Read TraceletMeta[] from a JSON file. Returns null if file missing or invalid. */
function readMetaFromFile(filePath: string): TraceletMeta[] | null {
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
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

/**
 * Merge file meta with param meta. Duplicates are keyed by method+path; param meta wins and duplicates are removed (param kept).
 */
function mergeMeta(fileMeta: TraceletMeta[], paramMeta: TraceletMeta[]): TraceletMeta[] {
  const byKey = new Map<string, TraceletMeta>();
  for (const r of fileMeta) byKey.set(routeKey(r), { ...r });
  for (const r of paramMeta) byKey.set(routeKey(r), { ...r });
  return Array.from(byKey.values());
}

const DEFAULT_DOCS_PATH = "/tracelet-docs";

/** Join parent path and child path (relative), normalizing slashes. */
function joinPath(parent: string, child: string): string {
  const p = parent.replace(/\/+$/, "") || "/";
  const c = child.replace(/^\/+/, "") || "";
  return c ? `${p}/${c}` : p;
}

/** Resolve full paths in the tree and flatten only each node's children (keep nested structure). */
function resolveMetaTree(routes: TraceletMeta[], parentPath = ""): TraceletMeta[] {
  return routes.map((r) => {
    const fullPath = parentPath ? joinPath(parentPath, r.path) : r.path;
    const { routes: children, ...rest } = r;
    const resolved: TraceletMeta = { ...rest, path: fullPath };
    if (children?.length) {
      resolved.routes = resolveMetaTree(children, fullPath);
    }
    return resolved;
  });
}

function resolveDefaultUiPath(): string {
  const searchPaths = [
    process.cwd(),
    __dirname,
    path.join(__dirname, ".."),
    path.join(__dirname, "../../.."),
  ];
  try {
    const mainPath = require.resolve("@tracelet/ui", { paths: searchPaths });
    const distPath = path.dirname(mainPath);
    if (fs.existsSync(path.join(distPath, "index.html"))) return distPath;
    const distFromPkg = path.join(distPath, "..", "dist");
    if (fs.existsSync(path.join(distFromPkg, "index.html"))) return distFromPkg;
    return distPath;
  } catch {
    try {
      const pkgPath = requireResolve.resolve("@tracelet/ui/package.json", {
        paths: searchPaths,
      });
      const distPath = path.join(path.dirname(pkgPath), "dist");
      if (fs.existsSync(path.join(distPath, "index.html"))) return distPath;
      return distPath;
    } catch(e) {
      console.error("Tracelet UI package path not found."+e);
      const fromDist = path.join(__dirname, "../../../sdk-ui/dist");
      const fromCwd = path.join(process.cwd(), "packages/sdk-ui/dist");
      if (fs.existsSync(path.join(fromDist, "index.html"))) return fromDist;
      if (fs.existsSync(path.join(fromCwd, "index.html"))) return fromCwd;
      return fromDist;
    }
  }
}

/**
 * Mounts the Tracelet docs UI on the given Express app.
 * Creates a route at `path` (default `/tracelet-docs`) serving the built UI and `?json=true` for route meta.
 */
export function traceletDoc(
  app: Application,
  meta: TraceletMeta[] = [],
  options: TraceletDocOptions = {}
) {
  const mountPath = options.path ?? DEFAULT_DOCS_PATH;
  const uiPath = path.resolve(options.uiPath ?? resolveDefaultUiPath());
  const indexHtml = path.join(uiPath, "index.html");
  const staticHandler = express.static(uiPath, { index: false });

  const docFilePath = options.docFilePath ?? path.join(process.cwd(), DEFAULT_DOC_FILE);
  const fileMeta = readMetaFromFile(docFilePath);
  const resolvedMeta = mergeMeta(fileMeta ?? [], meta ?? []);

  const handler = (req: Request, res: Response, next: NextFunction) => {
    if (req.query.json === "true") {
      return res.json(resolveMetaTree(resolvedMeta));
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    staticHandler(req, res, (err?: unknown) => {
      if (err) return next(err);
      if (res.headersSent) return;
      if (!fs.existsSync(indexHtml)) {
        return res
          .status(500)
          .set("Content-Type", "text/plain")
          .send("Tracelet UI not found. Build the UI or set uiPath."+indexHtml);
      }
      res.sendFile(indexHtml);
    });
  };

  app.use(mountPath, handler);
}
