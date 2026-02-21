import "reflect-metadata";
import { Controller, Get, Param, QueryParam, Req, Res } from "routing-controllers";
import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

const ENV_VALUES = ["development", "staging", "production"] as const;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

async function getSession(req: Request) {
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
}

async function isMemberOfOrg(userId: string, organizationId: string): Promise<boolean> {
  const m = await prisma.member.findFirst({
    where: { userId, organizationId },
  });
  return !!m;
}

@Controller("/organizations")
export class LogsController {
  /**
   * List request logs for an organization and environment.
   * Query: env, method, statusCode, route (substring), tracingId, dateFrom, dateTo, limit, cursor (id).
   */
  @Get("/:organizationId/logs")
  async list(
    @Param("organizationId") organizationId: string,
    @QueryParam("env") envQuery: string | undefined,
    @QueryParam("method") method: string | undefined,
    @QueryParam("statusCode") statusCodeStr: string | undefined,
    @QueryParam("route") routeSearch: string | undefined,
    @QueryParam("tracingId") tracingId: string | undefined,
    @QueryParam("dateFrom") dateFrom: string | undefined,
    @QueryParam("dateTo") dateTo: string | undefined,
    @QueryParam("limit") limitStr: string | undefined,
    @QueryParam("cursor") cursor: string | undefined,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    if (!(await isMemberOfOrg(session.user.id, organizationId))) {
      return res.status(404).json({ error: "Project not found" });
    }

    const env =
      envQuery && ENV_VALUES.includes(envQuery as (typeof ENV_VALUES)[number])
        ? (envQuery as (typeof ENV_VALUES)[number])
        : "development";

    const limit = Math.min(
      Math.max(1, parseInt(limitStr ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
      MAX_LIMIT
    );

    const statusCode =
      statusCodeStr !== undefined && statusCodeStr !== ""
        ? parseInt(statusCodeStr, 10)
        : undefined;
    const dateFromObj = dateFrom ? new Date(dateFrom) : undefined;
    const dateToObj = dateTo ? new Date(dateTo) : undefined;

    const where: {
      organizationId: string;
      env: string;
      type: string;
      method?: string;
      statusCode?: number;
      route?: { contains: string; mode: "insensitive" };
      tracingId?: string;
      timestamp?: { gte?: Date; lte?: Date };
      id?: { lt: string };
    } = {
      organizationId,
      env,
      type: "http",
    };

    if (method && method.trim()) where.method = method.trim().toUpperCase();
    if (statusCode !== undefined && !Number.isNaN(statusCode)) where.statusCode = statusCode;
    if (routeSearch && routeSearch.trim()) {
      where.route = { contains: routeSearch.trim(), mode: "insensitive" };
    }
    if (tracingId && tracingId.trim()) where.tracingId = tracingId.trim();
    if (dateFromObj && !Number.isNaN(dateFromObj.getTime())) {
      where.timestamp = { ...where.timestamp, gte: dateFromObj };
    }
    if (dateToObj && !Number.isNaN(dateToObj.getTime())) {
      where.timestamp = { ...where.timestamp, lte: dateToObj };
    }
    if (cursor) {
      where.id = { lt: cursor };
    }

    const [logs, total] = await Promise.all([
      prisma.logger.findMany({
        where,
        orderBy: [{ timestamp: "desc" }, { id: "desc" }],
        take: limit + 1,
        select: {
          id: true,
          requestId: true,
          tracingId: true,
          method: true,
          route: true,
          statusCode: true,
          durationMs: true,
          responseSize: true,
          timestamp: true,
          createdAt: true,
        },
      }),
      prisma.logger.count({ where }),
    ]);

    const hasMore = logs.length > limit;
    const items = hasMore ? logs.slice(0, limit) : logs;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return res.json({
      items,
      nextCursor,
      total,
      hasMore,
    });
  }

  /**
   * List application/custom logs (from request.traceletLogger) for an organization and environment.
   * Query: env, tracingId (optional), limit, cursor (id). Returns logs for the given tracingId or all.
   */
  @Get("/:organizationId/logs/app-logs")
  async listAppLogs(
    @Param("organizationId") organizationId: string,
    @QueryParam("env") envQuery: string | undefined,
    @QueryParam("tracingId") tracingId: string | undefined,
    @QueryParam("limit") limitStr: string | undefined,
    @QueryParam("cursor") cursor: string | undefined,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    if (!(await isMemberOfOrg(session.user.id, organizationId))) {
      return res.status(404).json({ error: "Project not found" });
    }

    const env =
      envQuery && ENV_VALUES.includes(envQuery as (typeof ENV_VALUES)[number])
        ? (envQuery as (typeof ENV_VALUES)[number])
        : "development";

    const limit = Math.min(
      Math.max(1, parseInt(limitStr ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
      MAX_LIMIT
    );

    const trimmedTracingId = tracingId?.trim();

    // App logs live in the appLogs array on the HTTP row (one row per API hit).
    if (trimmedTracingId) {
      const httpRow = await prisma.logger.findFirst({
        where: {
          organizationId,
          env,
          type: "http",
          tracingId: trimmedTracingId,
        },
        select: { id: true, requestId: true, appLogs: true },
      });
      const appLogsJson = httpRow?.appLogs;
      if (Array.isArray(appLogsJson) && appLogsJson.length > 0) {
        type AppLogRow = { level?: string; message?: string | null; payload?: unknown; timestamp?: string };
        const items = (appLogsJson as AppLogRow[]).map((a, i) => ({
          id: `${httpRow!.id}-app-${i}`,
          tracingId: trimmedTracingId,
          requestId: httpRow!.requestId,
          level: a.level ?? "info",
          message: a.message ?? null,
          payload: a.payload ?? null,
          timestamp: a.timestamp ?? new Date().toISOString(),
          createdAt: a.timestamp ?? new Date().toISOString(),
        }));
        return res.json({
          items,
          nextCursor: null,
          total: items.length,
          hasMore: false,
        });
      }
      return res.json({ items: [], nextCursor: null, total: 0, hasMore: false });
    }

    return res.json({ items: [], nextCursor: null, total: 0, hasMore: false });
  }

  /**
   * Get API explorer snapshot (route tree / TraceletMeta[]) for an organization and environment.
   */
  @Get("/:organizationId/api-explorer")
  async getApiExplorer(
    @Param("organizationId") organizationId: string,
    @QueryParam("env") envQuery: string | undefined,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    if (!(await isMemberOfOrg(session.user.id, organizationId))) {
      return res.status(404).json({ error: "Project not found" });
    }

    const env =
      envQuery && ENV_VALUES.includes(envQuery as (typeof ENV_VALUES)[number])
        ? (envQuery as (typeof ENV_VALUES)[number])
        : "development";

    const snapshot = await prisma.apiExplorerSnapshot.findUnique({
      where: {
        organizationId_env: {
          organizationId,
          env,
        },
      },
      select: { data: true, updatedAt: true },
    });

    if (!snapshot) {
      return res.json({ data: [], updatedAt: null });
    }

    return res.json({
      data: snapshot.data as unknown,
      updatedAt: snapshot.updatedAt.toISOString(),
    });
  }
}
