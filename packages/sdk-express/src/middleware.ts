import type { Request, Response, NextFunction } from "express";
import { Logger } from "@tracelet/core";

// Type for route info
interface RouteInfo {
  method: string;
  path: string;
}

const collectedRoutes: RouteInfo[] = [];

export function traceletMiddleware(logger: Logger, basePath: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    const path = req.originalUrl?.split("?")[0] ?? "";
    const route =
      path ||
      (req.baseUrl && req.path ? req.baseUrl + req.path : undefined) ||
      req.originalUrl ||
      req.url ||
      "";
      if (
        route === basePath ||
        route.startsWith(basePath + "/") ||
        route.startsWith("undefined")||
        route === "/.well-known/appspecific/com.chrome.devtools.json"
      ) {
        next();
        return;
      }

    const startTime = process.hrtime.bigint();
    const method = req.method;
    const tracingId = logger.init({ method, route });

    req.traceletRequestId = tracingId;
    req.traceletTracingId = tracingId;
    req.traceletLogger = logger;

    res.on("finish", () => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      const rawSize = res.getHeader("content-length");
      const responseSize =
        typeof rawSize === "string" || typeof rawSize === "number"
          ? rawSize
          : 0;

      logger.logHttp({
        method,
        route,
        statusCode: res.statusCode,
        durationMs,
        responseSize,
      });

      if (
        !collectedRoutes.some(
          (r) => r.method === req.method && r.path === route,
        )
      ) {
        collectedRoutes.push({ method: req.method, path: route });
      }
    });

    next();
  };
}
