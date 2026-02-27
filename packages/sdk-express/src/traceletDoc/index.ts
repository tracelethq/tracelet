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
import docHandler from "./handler/doc";
import { createLogsRouter } from "./handler/logs";

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

export type TraceletDocOptions = Partial<{
  uiTemplateOverrides?: TraceletUiTemplateOverrides;
  /** Path to the log file (from Logger). When set, GET /logs returns lines from this file. */
  logFilePath?: string;
}>;

/**
 * Mounts the Tracelet docs UI on the given Express app.
 * Creates a route at `path` (default `/tracelet-docs`) serving the built UI and `?json=true` for route meta.
 * When serving index.html, replaces template constants (TRACELET_UI_*) with the mount path and optional overrides.
 */
export function traceletDoc(
  routeMeta: RouteMeta,
  app: Application,
  options?: TraceletDocOptions,
) {
  const mountPath = options?.uiTemplateOverrides?.basePath ?? DEFAULT_DOCS_PATH;
  const logsRouter = createLogsRouter(options?.logFilePath);

  const handler = (req: Request, res: Response, next: NextFunction) => {
    docHandler(req, res, next, mountPath, routeMeta, options);
  };

  app.use(mountPath, authRouter);
  app.use(mountPath, logsRouter);
  app.use(mountPath, handler);
}
