import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { updateDashboardSnapshotFromIngest } from "./DashboardSnapshotService.js";

export type IngestContext = {
  organizationId: string;
  env: string;
};

export type HttpLogEntry = {
  type: "http";
  requestId: string;
  tracingId: string;
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  responseSize?: number;
  timestamp?: string | number;
};

export type AppLogEntry = {
  type: "app";
  tracingId: string;
  requestId?: string;
  level: string;
  message?: string;
  payload?: Record<string, unknown>;
  timestamp?: string | number;
};

export type IngestLogEntry = HttpLogEntry | AppLogEntry;

export type IngestPayload = {
  logs?: IngestLogEntry[];
  apiExplorer?: Record<string, unknown>;
};

export type IngestResult = {
  logsCount: number;
  apiExplorerUpdated: boolean;
};

export class IngestService {
  /**
   * Verifies the API key and returns organization + env context, or null if invalid.
   */
  async verifyApiKey(key: string): Promise<IngestContext | null> {
    try {
      const result = await (auth.api as {
        verifyApiKey?: (opts: { body: { key: string } }) => Promise<{
          valid?: boolean;
          key?: { metadata?: { organizationId?: string; env?: string } };
        }>;
      }).verifyApiKey?.({
        body: { key },
      });
      if (!result || typeof result !== "object" || !result.valid) return null;
      const metadata = result.key?.metadata;
      if (!metadata || typeof metadata !== "object") return null;
      const organizationId = metadata.organizationId;
      const env = metadata.env;
      if (typeof organizationId !== "string" || typeof env !== "string") return null;
      return { organizationId, env };
    } catch {
      return null;
    }
  }

  /**
   * Stores logs and/or API explorer snapshot for the given context.
   * Groups logs by tracingId: one row per HTTP request with appLogs array (fewer rows).
   */
  async ingest(context: IngestContext, payload: IngestPayload): Promise<IngestResult> {
    const { logs = [], apiExplorer } = payload;

    if (logs.length > 0) {
      const validLevels = ["debug", "info", "warn", "error"];
      const byTracingId = new Map<string, { http: HttpLogEntry | null; app: AppLogEntry[] }>();
      for (const log of logs) {
        const key = log.tracingId;
        if (!byTracingId.has(key)) byTracingId.set(key, { http: null, app: [] });
        const group = byTracingId.get(key)!;
        if (log.type === "http") {
          group.http = log;
        } else {
          if (validLevels.includes(log.level)) group.app.push(log);
        }
      }
      const rows: Array<{
        organizationId: string;
        env: string;
        type: "http";
        tracingId: string;
        requestId: string | null;
        timestamp: Date;
        method: string;
        route: string;
        statusCode: number;
        durationMs: number;
        responseSize: number;
        appLogs?: object;
      }> = [];
      for (const [, group] of byTracingId) {
        if (!group.http) continue;
        const h = group.http;
        const appLogsArray = group.app.map((a) => ({
          level: a.level,
          message: a.message ?? null,
          payload: a.payload ?? null,
          timestamp: a.timestamp != null ? (typeof a.timestamp === "number" ? new Date(a.timestamp).toISOString() : a.timestamp) : new Date().toISOString(),
        }));
        rows.push({
          organizationId: context.organizationId,
          env: context.env,
          type: "http",
          tracingId: h.tracingId,
          requestId: h.requestId ?? null,
          timestamp: h.timestamp != null ? new Date(h.timestamp) : new Date(),
          method: h.method,
          route: h.route,
          statusCode: h.statusCode,
          durationMs: h.durationMs,
          responseSize: h.responseSize ?? 0,
          ...(appLogsArray.length > 0 && { appLogs: appLogsArray as object }),
        });
      }
      if (rows.length > 0) {
        await prisma.logger.createMany({ data: rows });
      }
    }

    let apiExplorerUpdated = false;
    if (apiExplorer != null && Object.keys(apiExplorer).length > 0) {
      await prisma.apiExplorerSnapshot.upsert({
        where: {
          organizationId_env: {
            organizationId: context.organizationId,
            env: context.env,
          },
        },
        create: {
          organizationId: context.organizationId,
          env: context.env,
          data: apiExplorer as object,
        },
        update: {
          data: apiExplorer as object,
        },
      });
      apiExplorerUpdated = true;
    }

    const httpLogs = logs.filter((l) => l.type === "http");
    const hasSnapshotUpdate = httpLogs.length > 0 || (apiExplorer != null && Object.keys(apiExplorer).length > 0);
    if (hasSnapshotUpdate) {
      setImmediate(() => {
        let totalRoutes: number | undefined;
        if (apiExplorer != null && Object.keys(apiExplorer).length > 0) {
          const data = apiExplorer as { routes?: unknown[] };
          const routes = Array.isArray(data) ? data : data.routes;
          if (Array.isArray(routes)) {
            const count = (arr: unknown[]): number =>
              arr.reduce<number>((n, r) => {
                const x = r as { method?: string; routes?: unknown[] };
                return n + (x.method && x.method !== "PARENT" ? 1 : 0) + (Array.isArray(x.routes) ? count(x.routes) : 0);
              }, 0);
            totalRoutes = count(routes);
          }
        }
        updateDashboardSnapshotFromIngest(context.organizationId, context.env, httpLogs, totalRoutes).catch((err) =>
          console.error("[dashboard-snapshot] update after ingest failed:", err)
        );
      });
    }

    return {
      logsCount: logs.length,
      apiExplorerUpdated,
    };
  }
}
