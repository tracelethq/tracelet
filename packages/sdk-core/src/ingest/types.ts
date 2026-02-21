/**
 * HTTP log entry (type "http") sent to the ingest API.
 */
export interface IngestHttpLogEntry {
  type: "http";
  requestId: string;
  tracingId: string;
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  responseSize?: number;
  timestamp?: string | number;
}

/**
 * Application/custom log entry (type "app") from request.traceletLogger.
 */
export interface IngestAppLogEntry {
  type: "app";
  tracingId: string;
  requestId?: string;
  level: "debug" | "info" | "warn" | "error";
  message?: string;
  payload?: Record<string, unknown>;
  timestamp?: string | number;
}

export type IngestLogEntry = IngestHttpLogEntry | IngestAppLogEntry;

/**
 * Payload for POST /api/ingest. logs = HTTP and app log entries (discriminated by type).
 */
export interface IngestPayload {
  logs?: IngestLogEntry[];
  apiExplorer?: Record<string, unknown>;
}

/**
 * Response from the ingest API (202).
 */
export interface IngestResult {
  ok: boolean;
  logs: number;
  apiExplorerUpdated: boolean;
}

export interface IngestClientOptions {
  /** API key for the project/env (x-api-key or Bearer). */
  apiKey: string;
}
