import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import {
  createRouteMeta,
  resolveDefaultUiPath,
  type TraceletMeta,
} from "@tracelet/core";
import fs from "fs";
import path from "path";
import authRouter, { auth } from "./handler/auth";

/** Options for the tracelet docs UI. */
export interface TraceletDocOptions {
  /** Path to JSON file for route meta (e.g. tracelet.doc.json). Defaults to `tracelet.doc.json` in process.cwd(). */
  docFilePath?: string;
}

const DEFAULT_DOCS_PATH = "/tracelet-docs";

/**
 * Mounts the Tracelet docs UI on the given Express app.
 * Creates a route at `path` (default `/tracelet-docs`) serving the built UI and `?json=true` for route meta.
 */
export function traceletDoc(
  app: Application,
  meta: TraceletMeta[] = [],
  options: TraceletDocOptions = {}
) {
  const routeMeta = createRouteMeta();
  const mountPath = DEFAULT_DOCS_PATH;
  const uiPath = path.resolve(resolveDefaultUiPath());
  const indexHtml = path.join(uiPath, "index.html");
  const staticHandler = express.static(uiPath, { index: false });

  const docFilePath =
    options.docFilePath ?? path.join(process.cwd(), routeMeta.defaultDocFile);
  const resolvedMeta = routeMeta.loadAndMerge(docFilePath, meta ?? []);

  const handler = (req: Request, res: Response, next: NextFunction) => {
    if(req.query.json === "true") {
      if(!auth.isAuthRequired()){
        return res.json(routeMeta.resolveTree(resolvedMeta));
      }
      if(auth.isAuthRequired()&& auth.verifyRequest(req.headers.authorization)){
        return res.json(routeMeta.resolveTree(resolvedMeta));
      }
      return res.status(401).json({ error: "Unauthorized" });
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

  app.use(mountPath, authRouter);
  app.use(mountPath, handler);
}
