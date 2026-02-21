import { getEnv } from "../lib/env";
import type { HttpLogInput } from "../logger/index";
import { DEFAULT_INGEST_BASE_URL, DEFAULT_INGEST_PATH, env, LOG_START_PREFIX, LogMessages } from "../lib/constants";
import type { IngestHttpLogEntry, IngestPayload, IngestResult } from "./types";

/**
 * Converts Logger HTTP log input to an ingest log entry (normalizes responseSize and timestamp).
 */
export function toIngestLogEntry(input: HttpLogInput): IngestHttpLogEntry {
  const responseSize =
    input.responseSize != null
      ? typeof input.responseSize === "string"
        ? parseInt(input.responseSize, 10) || 0
        : Number(input.responseSize) || 0
      : undefined;
  return {
    type: "http",
    requestId: input.requestId ?? "unknown",
    tracingId: input.tracingId ?? "unknown",
    method: input.method,
    route: input.route,
    statusCode: input.statusCode,
    durationMs: input.durationMs,
    ...(responseSize !== undefined && { responseSize }),
    ...(input.timestamp !== undefined && { timestamp: input.timestamp }),
  };
}

export interface IngestClientConstructorOptions {
  /** API key for the project/env (x-api-key). Defaults to TRACELET_API_KEY env. */
  apiKey?: string;
  /** Backend base URL; defaults to DEFAULT_INGEST_BASE_URL. */
  baseUrl?: string;
  environment?: "local" | null
}

/**
 * Client for sending logs and API explorer data to the Tracelet ingest API.
 */
export class IngestClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly environment?: "local" | null;
  constructor(options: IngestClientConstructorOptions = {}) {
    this.environment = options.environment
    const apiKey = options.apiKey ?? getEnv("TRACELET_API_KEY") ?? "";
    if (!apiKey.trim() && !options.environment) {
      console.warn(`${LOG_START_PREFIX} ${LogMessages.TRACELET_API_KEY_NOT_SET}`);
    }
    this.baseUrl = options.baseUrl ?? DEFAULT_INGEST_BASE_URL;
    this.apiKey = apiKey;
  }

  public checkApiKey(): boolean {
    if (!this.apiKey.trim()) {
      return false;
    }
    return true;
  }

  /**
   * Sends logs (and optional apiExplorer) to the ingest API. The backend stores
   * logs in the DB (RequestLog) and optionally updates the API explorer snapshot.
   *
   * @param payload - Logs and optional apiExplorer
   * @returns Ingest result or throws on non-2xx
   */
  async send(payload: IngestPayload): Promise<IngestResult | undefined> {
    if(this.environment === env.LOCAL) {
      console.log(`${LOG_START_PREFIX} ${LogMessages.INGEST_SKIPPED_IN_LOCAL_ENVIRONMENT}`);
      return undefined;
    }
    if (!this.checkApiKey()) {
      throw new Error(`${LOG_START_PREFIX} ${LogMessages.TRACELET_API_KEY_NOT_SET_ERROR}`);
    }
    const url = this.baseUrl.replace(/\/$/, "") + DEFAULT_INGEST_PATH;
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey.trim(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      let errMessage = `Ingest failed: ${res.status} ${res.statusText}`;
      try {
        const json = JSON.parse(text) as { error?: string };
        if (json?.error) errMessage = json.error;
      } catch {
        if (text) errMessage += ` - ${text.slice(0, 200)}`;
      }
      throw new Error(errMessage);
    }

    const data = (await res.json()) as IngestResult;
    return data;
  }
}
