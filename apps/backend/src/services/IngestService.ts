import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

export type IngestContext = {
  organizationId: string;
  env: string;
};

export type LogEntry = {
  requestId: string;
  tracingId: string;
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  responseSize?: number;
  timestamp?: string | number;
};

export type IngestPayload = {
  logs: LogEntry[];
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
   */
  async ingest(context: IngestContext, payload: IngestPayload): Promise<IngestResult> {
    const { logs, apiExplorer } = payload;

    if (logs.length > 0) {
      await prisma.requestLog.createMany({
        data: logs.map((log) => ({
          organizationId: context.organizationId,
          env: context.env,
          requestId: log.requestId,
          tracingId: log.tracingId,
          method: log.method,
          route: log.route,
          statusCode: log.statusCode,
          durationMs: log.durationMs,
          responseSize: log.responseSize ?? 0,
          timestamp: log.timestamp != null ? new Date(log.timestamp) : new Date(),
        })),
      });
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

    return {
      logsCount: logs.length,
      apiExplorerUpdated,
    };
  }
}
