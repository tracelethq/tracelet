import type { Request, Response, NextFunction } from "express";
import { createLogger } from "@tracelet/core";

interface TraceletExpressOptions {
  serviceName: string;
  environment?: string;
}

// Type for route info
interface RouteInfo {
  method: string;
  path: string;
}

const collectedRoutes: RouteInfo[] = [];

export function traceletMiddleware(options: TraceletExpressOptions) {
  const logger = createLogger({
    serviceName: options.serviceName,
    environment: options.environment ?? "prod",
  });

  return function (req: Request, res: Response, next: NextFunction) {
    const startTime = process.hrtime.bigint();
    const tracingId = logger.createTracingId();

    req.traceletRequestId = tracingId;
    req.traceletTracingId = tracingId;
    req.traceletLogger = logger;

    res.on("finish", () => {
      const path = req.originalUrl.split("?")[0];
      const route =
        req.route?.path || req.baseUrl + req.path || req.originalUrl;
      if (path === "/tracelet-docs" || path.startsWith("/tracelet-docs/") || route.startsWith("undefined")) {
        return;
      }

      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      const rawSize = res.getHeader("content-length");
      const responseSize =
        typeof rawSize === "string" || typeof rawSize === "number"
          ? rawSize
          : 0;

      logger.logHttp({
        requestId: tracingId,
        tracingId,
        method: req.method,
        route,
        statusCode: res.statusCode,
        durationMs,
        responseSize,
      });

      if (!collectedRoutes.some((r) => r.method === req.method && r.path === route)) {
        collectedRoutes.push({ method: req.method, path: route });
      }
    });

    next();
  };
}
