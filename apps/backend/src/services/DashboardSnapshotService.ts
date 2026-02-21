import { prisma } from "../lib/prisma.js";

export type HttpLogEntryForCount = {
  type: string;
  statusCode?: number;
};

function getSnapshotDelegate(): { findUnique: (args: unknown) => Promise<unknown>; update: (args: unknown) => Promise<unknown>; upsert: (args: unknown) => Promise<unknown> } | null {
  const d = (prisma as unknown as Record<string, unknown>)["dashboardSnapshot"];
  if (!d || typeof (d as { findUnique?: unknown }).findUnique !== "function") return null;
  return d as { findUnique: (args: unknown) => Promise<unknown>; update: (args: unknown) => Promise<unknown>; upsert: (args: unknown) => Promise<unknown> };
}

/**
 * Updates dashboard snapshot from a batch of ingested HTTP logs.
 * Call this asynchronously (fire-and-forget) after ingest so it does not block the ingest response.
 * No-op if DashboardSnapshot is not available (table not migrated / client not generated).
 */
export async function updateDashboardSnapshotFromIngest(
  organizationId: string,
  env: string,
  httpLogs: HttpLogEntryForCount[],
  totalRoutes?: number
): Promise<void> {
  const delegate = getSnapshotDelegate();
  if (!delegate) return;

  let success = 0;
  let clientError = 0;
  let serverError = 0;
  for (const log of httpLogs) {
    if (log.type !== "http" || log.statusCode == null) continue;
    if (log.statusCode >= 200 && log.statusCode < 300) success++;
    else if (log.statusCode >= 400 && log.statusCode < 500) clientError++;
    else if (log.statusCode >= 500) serverError++;
  }
  const added = httpLogs.filter((l) => l.type === "http").length;
  if (added === 0 && totalRoutes === undefined) return;

  const existing = await delegate.findUnique({
    where: {
      organizationId_env: { organizationId, env },
    },
  });

  const now = new Date();
  const existingRow = existing as { id: string; totalHttpLogs: number; successCount: number; clientErrorCount: number; serverErrorCount: number } | null;
  if (existingRow) {
    await delegate.update({
      where: { id: existingRow.id },
      data: {
        totalHttpLogs: existingRow.totalHttpLogs + added,
        successCount: existingRow.successCount + success,
        clientErrorCount: existingRow.clientErrorCount + clientError,
        serverErrorCount: existingRow.serverErrorCount + serverError,
        ...(totalRoutes !== undefined && { totalRoutes }),
        updatedAt: now,
      },
    });
  } else {
    await delegate.upsert({
      where: {
        organizationId_env: { organizationId, env },
      },
      create: {
        organizationId,
        env,
        totalHttpLogs: added,
        successCount: success,
        clientErrorCount: clientError,
        serverErrorCount: serverError,
        totalRoutes: totalRoutes ?? 0,
        updatedAt: now,
      },
      update: {
        totalHttpLogs: { increment: added },
        successCount: { increment: success },
        clientErrorCount: { increment: clientError },
        serverErrorCount: { increment: serverError },
        ...(totalRoutes !== undefined && { totalRoutes }),
        updatedAt: now,
      },
    });
  }
}

/**
 * Recalculate snapshot from Logger table and optionally update totalRoutes from ApiExplorerSnapshot.
 * Used by dashboard refresh API. No-op if DashboardSnapshot is not available.
 */
export async function refreshDashboardSnapshot(
  organizationId: string,
  env: string
): Promise<void> {
  const delegate = getSnapshotDelegate();
  if (!delegate) return;

  const baseWhere = {
    organizationId,
    env,
    type: "http" as const,
  };

  const [totalHttpLogs, successCount, clientErrorCount, serverErrorCount, apiExplorer] =
    await Promise.all([
      prisma.logger.count({ where: baseWhere }),
      prisma.logger.count({
        where: { ...baseWhere, statusCode: { gte: 200, lt: 300 } },
      }),
      prisma.logger.count({
        where: { ...baseWhere, statusCode: { gte: 400, lt: 500 } },
      }),
      prisma.logger.count({
        where: { ...baseWhere, statusCode: { gte: 500 } },
      }),
      prisma.apiExplorerSnapshot.findUnique({
        where: { organizationId_env: { organizationId, env } },
        select: { data: true },
      }),
    ]);

  let totalRoutes = 0;
  const data = apiExplorer?.data as { routes?: unknown[] } | null | undefined;
  if (data && typeof data === "object") {
    const routes = Array.isArray(data) ? data : data.routes;
    if (Array.isArray(routes)) {
      const count = (arr: unknown[]): number =>
        arr.reduce<number>((n, r) => {
          const x = r as { method?: string; routes?: unknown[] };
          return (
            n +
            (x.method && x.method !== "PARENT" ? 1 : 0) +
            (Array.isArray(x.routes) ? count(x.routes) : 0)
          );
        }, 0);
      totalRoutes = count(routes);
    }
  }

  const now = new Date();
  await delegate.upsert({
    where: { organizationId_env: { organizationId, env } },
    create: {
      organizationId,
      env,
      totalHttpLogs,
      successCount,
      clientErrorCount,
      serverErrorCount,
      totalRoutes,
      updatedAt: now,
    },
    update: {
      totalHttpLogs,
      successCount,
      clientErrorCount,
      serverErrorCount,
      totalRoutes,
      updatedAt: now,
    },
  });
}
