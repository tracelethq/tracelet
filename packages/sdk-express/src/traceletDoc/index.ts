import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import {
  resolveDefaultUiPath,
  RouteMeta
} from "@tracelet/core";
import fs from "fs";
import path from "path";
import authRouter, { auth } from "./handler/auth";

const DEFAULT_DOCS_PATH = "/tracelet-docs";

/**
 * Template constants used in @tracelet/ui index.html. Replace these when serving the UI
 * so title, script src, and asset base path match your mount path.
 */
export const TRACELET_UI_TEMPLATE_CONSTANTS = {
  TRACELET_UI_CONSTANTS: "TRACELET_UI_CONSTANTS",
} as const;

export type TraceletUiTemplateOverrides = Partial<{
  basePath?: string;
  title?: string;
}>;

function replaceTemplateConstants(
  html: string,
  vars: Record<string, string>,
): string {
  let out = html;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return out;
}

/**
 * Mounts the Tracelet docs UI on the given Express app.
 * Creates a route at `path` (default `/tracelet-docs`) serving the built UI and `?json=true` for route meta.
 * When serving index.html, replaces template constants (TRACELET_UI_*) with the mount path and optional overrides.
 */
export function traceletDoc(
  routeMeta: RouteMeta,
  app: Application,
  options?: { uiTemplateOverrides?: TraceletUiTemplateOverrides },
) {
  const mountPath = options?.uiTemplateOverrides?.basePath ?? DEFAULT_DOCS_PATH;
  const uiPath = path.resolve(resolveDefaultUiPath());
  const indexHtmlPath = path.join(uiPath, "index.html");
  const staticHandler = express.static(uiPath, { index: false });
  const overrides = options?.uiTemplateOverrides ?? {};

  const resolvedMeta = routeMeta.loadAndMerge();

  const handler = (req: Request, res: Response, next: NextFunction) => {
    if (req.query.json === "true") {
      if (!auth.isAuthRequired()) {
        return res.json(resolvedMeta);
      }
      if (
        auth.isAuthRequired() &&
        auth.verifyRequest(req.headers.authorization)
      ) {
        return res.json(resolvedMeta);
      }
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    staticHandler(req, res, (err?: unknown) => {
      if (err) return next(err);
      if (res.headersSent) return;
      if (!fs.existsSync(indexHtmlPath)) {
        return res
          .status(500)
          .set("Content-Type", "text/plain")
          .send(
            "Tracelet UI not found. Build the UI or set uiPath. " + indexHtmlPath,
          );
      }
      const base = mountPath.endsWith("/") ? mountPath.slice(0, -1) : mountPath;
      const constantsJson = JSON.stringify({
        basePath: overrides.basePath ?? (base || "."),
        title: overrides.title ?? "Tracelet Docs",
      });
      const templateVars: Record<string, string> = {
        [TRACELET_UI_TEMPLATE_CONSTANTS.TRACELET_UI_CONSTANTS]: constantsJson,
        ...overrides,
      };
      const html = replaceTemplateConstants(
        fs.readFileSync(indexHtmlPath, "utf-8"),
        templateVars,
      );
      res.set("Content-Type", "text/html; charset=utf-8").send(html);
    });
  };

  app.use(mountPath, authRouter);
  app.use(mountPath, handler);
}
