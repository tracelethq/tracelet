import "reflect-metadata";
import { Controller, Get, Param, QueryParam, Req, Res, Post } from "routing-controllers";
import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { refreshDashboardSnapshot } from "../services/DashboardSnapshotService.js";

const ENV_VALUES = ["development", "staging", "production"] as const;

async function getSession(req: Request) {
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
}

async function isMemberOfOrg(userId: string, organizationId: string): Promise<boolean> {
  const m = await prisma.member.findFirst({
    where: { userId, organizationId },
  });
  return !!m;
}

type SnapshotRow = {
  totalHttpLogs: number;
  successCount: number;
  clientErrorCount: number;
  serverErrorCount: number;
  totalRoutes: number;
} | null;

/** Use DashboardSnapshot if the client has it (table migrated + client generated); otherwise return null. */
async function getSnapshotSafe(organizationId: string, env: string): Promise<SnapshotRow> {
  const delegate = (prisma as unknown as Record<string, unknown>)["dashboardSnapshot"];
  if (!delegate || typeof (delegate as { findUnique?: (args: unknown) => Promise<SnapshotRow> }).findUnique !== "function") {
    return null;
  }
  try {
    return await (delegate as { findUnique: (args: unknown) => Promise<SnapshotRow> }).findUnique({
      where: { organizationId_env: { organizationId, env } },
    });
  } catch {
    return null;
  }
}

@Controller("/organizations")
export class DashboardController {
  /**
   * Dashboard stats for an organization and environment.
   * Reads aggregates from DashboardSnapshot when available; otherwise computes from Logger.
   */
  @Get("/:organizationId/dashboard")
  async getStats(
    @Param("organizationId") organizationId: string,
    @QueryParam("env") envQuery: string | undefined,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const session = await getSession(req);
      if (!session) return res.status(401).json({ error: "Unauthorized" });

      if (!(await isMemberOfOrg(session.user.id, organizationId))) {
        return res.status(404).json({ error: "Project not found" });
      }

      const env =
        envQuery && ENV_VALUES.includes(envQuery as (typeof ENV_VALUES)[number])
          ? (envQuery as (typeof ENV_VALUES)[number])
          : "development";

      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const baseWhere = {
        organizationId,
        env,
        type: "http" as const,
      };

      const where24h = { ...baseWhere, timestamp: { gte: last24h } };
      const snapshot = await getSnapshotSafe(organizationId, env);

      const [
        logsLast24h,
        recentLogs,
        hourlyCounts,
        statusCountsFromDb,
        apiExplorerSnapshot,
        avgAgg,
        durationsForP95,
        slowestByRoute,
        mostUsedByRoute,
      ] = await Promise.all([
        prisma.logger.count({ where: where24h }),
        prisma.logger.findMany({
          where: baseWhere,
          orderBy: [{ timestamp: "desc" }],
          take: 8,
          select: {
            id: true,
            method: true,
            route: true,
            statusCode: true,
            durationMs: true,
            timestamp: true,
          },
        }),
        (async () => {
          const hours: { hour: string; count: number }[] = [];
          for (let i = 23; i >= 0; i--) {
            const start = new Date(now);
            start.setHours(now.getHours() - i, 0, 0, 0);
            const end = new Date(start);
            end.setHours(end.getHours() + 1, 0, 0, 0);
            const count = await prisma.logger.count({
              where: { ...baseWhere, timestamp: { gte: start, lt: end } },
            });
            hours.push({ hour: start.toISOString(), count });
          }
          return hours;
        })(),
        snapshot == null
          ? Promise.all([
              prisma.logger.count({ where: baseWhere }),
              prisma.logger.count({ where: { ...baseWhere, statusCode: { gte: 200, lt: 300 } } }),
              prisma.logger.count({ where: { ...baseWhere, statusCode: { gte: 400, lt: 500 } } }),
              prisma.logger.count({ where: { ...baseWhere, statusCode: { gte: 500 } } }),
            ])
          : Promise.resolve(null),
        prisma.apiExplorerSnapshot.findUnique({
          where: { organizationId_env: { organizationId, env } },
          select: { data: true },
        }),
        prisma.logger.aggregate({
          where: { ...where24h, durationMs: { not: null } },
          _avg: { durationMs: true },
          _count: true,
        }),
        prisma.logger.findMany({
          where: { ...where24h, durationMs: { not: null } },
          select: { durationMs: true },
          orderBy: { durationMs: "desc" },
          take: 5000,
        }),
        prisma.logger.groupBy({
          by: ["route"],
          where: { ...where24h, route: { not: null }, durationMs: { not: null } },
          _avg: { durationMs: true },
          _count: true,
        }),
        prisma.logger.groupBy({
          by: ["route"],
          where: { ...where24h, route: { not: null } },
          _count: true,
        }),
      ]);

      const totalHttpLogs = snapshot?.totalHttpLogs ?? statusCountsFromDb?.[0] ?? 0;
      const status2xx = snapshot?.successCount ?? statusCountsFromDb?.[1] ?? 0;
      const status4xx = snapshot?.clientErrorCount ?? statusCountsFromDb?.[2] ?? 0;
      const status5xx = snapshot?.serverErrorCount ?? statusCountsFromDb?.[3] ?? 0;
      const errorRatePercent =
        totalHttpLogs > 0 ? (100 * (status4xx + status5xx)) / totalHttpLogs : 0;
      const avgResponseTimeMs = avgAgg._avg.durationMs != null ? Math.round(avgAgg._avg.durationMs) : null;
      const sorted = (durationsForP95.map((r) => r.durationMs) as number[]).filter((d) => d != null).sort((a, b) => a - b);
      const p95Index = Math.floor(sorted.length * 0.95) - 1;
      const p95LatencyMs = sorted.length > 0 && p95Index >= 0 ? sorted[p95Index]! : null;

      let routeCount = snapshot?.totalRoutes ?? 0;
      if (routeCount === 0 && apiExplorerSnapshot?.data) {
        const data = apiExplorerSnapshot.data as { routes?: unknown[] };
        const routes = Array.isArray(data) ? data : data.routes;
        if (Array.isArray(routes)) {
          const count = (arr: unknown[]): number =>
            arr.reduce<number>((n, r) => {
              const x = r as { method?: string; routes?: unknown[] };
              return n + (x.method && x.method !== "PARENT" ? 1 : 0) + (Array.isArray(x.routes) ? count(x.routes) : 0);
            }, 0);
          routeCount = count(routes);
        }
      }

      const errorDistribution = [
        { label: "2xx", count: status2xx },
        { label: "4xx", count: status4xx },
        { label: "5xx", count: status5xx },
      ];
      const slowestEndpoints = slowestByRoute
        .map((r) => ({
          route: r.route ?? "",
          avgDurationMs: r._avg.durationMs != null ? Math.round(r._avg.durationMs) : 0,
          count: r._count,
        }))
        .sort((a, b) => b.avgDurationMs - a.avgDurationMs)
        .slice(0, 10);
      const mostUsedEndpoints = mostUsedByRoute
        .map((r) => ({ route: r.route ?? "", count: r._count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return res.json({
        totalEvents: totalHttpLogs,
        totalHttpLogs,
        logsLast24h,
        errorRatePercent: Math.round(errorRatePercent * 10) / 10,
        avgResponseTimeMs,
        p95LatencyMs,
        statusCounts: {
          success: status2xx,
          clientError: status4xx,
          serverError: status5xx,
        },
        eventsOverTime: hourlyCounts,
        requestsOverTime: hourlyCounts,
        errorDistribution,
        slowestEndpoints,
        mostUsedEndpoints,
        recentLogs: recentLogs.map((l) => ({
          id: l.id,
          method: l.method,
          route: l.route,
          statusCode: l.statusCode,
          durationMs: l.durationMs,
          timestamp: l.timestamp.toISOString(),
        })),
        totalRoutes: routeCount,
      });
    } catch {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Recalculate dashboard snapshot from Logger (and API explorer for route count) and return latest stats.
   * No-op if DashboardSnapshot is not available (table not migrated / client not generated).
   */
  @Post("/:organizationId/dashboard/refresh")
  async refresh(
    @Param("organizationId") organizationId: string,
    @QueryParam("env") envQuery: string | undefined,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const session = await getSession(req);
      if (!session) return res.status(401).json({ error: "Unauthorized" });

      if (!(await isMemberOfOrg(session.user.id, organizationId))) {
        return res.status(404).json({ error: "Project not found" });
      }

      const env =
        envQuery && ENV_VALUES.includes(envQuery as (typeof ENV_VALUES)[number])
          ? (envQuery as (typeof ENV_VALUES)[number])
          : "development";

      await refreshDashboardSnapshot(organizationId, env);
      return this.getStats(organizationId, env, req, res);
    } catch {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
