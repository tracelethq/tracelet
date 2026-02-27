import express, { NextFunction, Request, Response } from "express";
import { auth } from "./auth";
import fs from "fs";
import path from "path";

import { resolveDefaultUiPath, RouteMeta } from "@tracelet/core";
import { TRACELET_UI_TEMPLATE_CONSTANTS, TraceletUiTemplateOverrides } from "..";

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

const docHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  mountPath: string,
  routeMeta: RouteMeta,
  options?: { uiTemplateOverrides?: TraceletUiTemplateOverrides },
) => {
  const uiPath = path.resolve(resolveDefaultUiPath());
  const indexHtmlPath = path.join(uiPath, "index.html");
  const staticHandler = express.static(uiPath, { index: false });
  const overrides = options?.uiTemplateOverrides ?? {};

  const resolvedMeta = routeMeta.loadAndMerge();
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

export default docHandler;
