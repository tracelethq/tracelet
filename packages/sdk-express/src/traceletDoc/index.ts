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
  meta: TraceletMeta[],
  options: TraceletDocOptions = {}
) {
  const mountPath = options.path ?? DEFAULT_DOCS_PATH;
  const uiPath = path.resolve(options.uiPath ?? resolveDefaultUiPath());
  const indexHtml = path.join(uiPath, "index.html");
  const staticHandler = express.static(uiPath, { index: false });

  const handler = (req: Request, res: Response, next: NextFunction) => {
    if (req.query.json === "true") {
      return res.json(resolveMetaTree(meta));
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
