import type { Request, Response, NextFunction } from "express";
import { createLogger } from "@tracelet/core";
import { randomUUID } from "crypto";

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
    const requestId = randomUUID();

    // attach requestId so user can access it
    req.traceletRequestId = requestId;
    req.traceletLogger = logger;

    res.on("finish", () => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;

      const route =
        req.route?.path || req.baseUrl + req.path || req.originalUrl;

      const responseSize = res.getHeader("content-length") || 0;

      const logPayload = {
        type: "http",
        requestId,
        method: req.method,
        route,
        statusCode: res.statusCode,
        duration_ms: Math.round(durationMs),
        responseSize,
        timestamp: new Date().toISOString(),
      };

      if (res.statusCode >= 500) {
        logger.error(logPayload);
      } else {
        logger.info(logPayload);
      }

       // Collect route automatically
       if (!collectedRoutes.some(r => r.method === req.method && r.path === route)) {
        collectedRoutes.push({ method: req.method, path: route });
      }
    });

    next();
  };
}
