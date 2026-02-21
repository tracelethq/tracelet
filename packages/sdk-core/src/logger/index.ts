// import { IngestClient, toIngestLogEntry } from "../ingest";
// import type { IngestAppLogEntry } from "../ingest/types";
import { env, LOG_START_PREFIX } from "../lib/constants";
import { writeLogEntry } from "./file-writer";

export interface LoggerOptions {
  serviceName: string;
  environment?: string;
  /** Ingest client for sending HTTP logs; created with env defaults if not provided. */
  // ingestClient: IngestClient;
  /**
   * When set, each log entry is appended to this file in logging format (Node only):
   * [timestamp] LEVEL message for app logs, [timestamp] HTTP METHOD route STATUS duration size for HTTP.
   * Ignored in browser. Directory and file are created if missing.
   */
  logFilePath?: string;
}

export interface LogPayload {
  [key: string]: unknown;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

/** IDs for a single request/trace. Create via Logger.createRequestIds(); do not create in framework code. */
export interface RequestIds {
  requestId: string;
  tracingId: string;
}

/** Input for HTTP request logging. Pass raw values; use Logger.createRequestIds() for requestId/tracingId. */
export interface HttpLogInput {
  requestId?: string;
  tracingId?: string;
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  responseSize?: string | number;
  timestamp?: string;
}

interface InitInput {
  method: string;
  route: string;
}

function randomUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** ANSI codes for dev-only colored output (no dependency). */
const ANSI = {
  dim: "\u001b[2m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  red: "\u001b[31m",
  cyan: "\u001b[36m",
  magenta: "\u001b[35m",
  reset: "\u001b[0m",
} as const;

/**
 * Colorize a pretty-printed JSON string for terminal output (keys, strings, numbers, literals).
 */
function highlightJson(jsonStr: string): string {
  return jsonStr
    .replace(/^(\s*)("(?:[^"\\]|\\.)*")(\s*:)/gm, (_, space, key, colon) => {
      return `${space}${ANSI.cyan}${key}${ANSI.reset}${colon}`;
    })
    .replace(
      /: (\d+\.?\d*)/g,
      (m) => `: ${ANSI.yellow}${m.slice(2)}${ANSI.reset}`,
    )
    .replace(
      /: (true|false|null)\b/g,
      (m) => `: ${ANSI.magenta}${m.slice(2)}${ANSI.reset}`,
    )
    .replace(/: ("(?:[^"\\]|\\.)*")/g, (m) => {
      const value = m.slice(2);
      return `: ${ANSI.green}${value}${ANSI.reset}`;
    });
}

function formatResponseSize(raw: string | number | undefined): string {
  const n = typeof raw === "string" ? parseInt(raw, 10) : Number(raw ?? 0);
  if (!Number.isFinite(n) || n < 0) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} kB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function statusColor(code: number): string {
  if (code >= 500) return ANSI.red;
  if (code >= 400) return ANSI.yellow;
  if (code >= 300) return ANSI.cyan;
  return ANSI.green;
}

function shortId(id: string): string {
  return id.length >= 8 ? id.slice(0, 8) : id;
}

/**
 * Formatted HTTP log for dev: one scannable block so backend devs see method, route,
 * status, duration, size, and ids at a glance.
 */
function formatHttpLogDev(serviceName: string, input: HttpLogInput): string {
  const ts = input.timestamp ?? new Date().toISOString();
  const size = formatResponseSize(input.responseSize);
  const duration = `${Math.round(input.durationMs)}ms`;
  const status = input.statusCode;
  const statusLabel =
    status >= 500
      ? "ERROR"
      : status >= 400
        ? "CLIENT_ERR"
        : status >= 300
          ? "REDIRECT"
          : "OK";
  const statusStr = `${status} ${statusLabel}`;
  const color = statusColor(status);
  const reqId = shortId(input.requestId ?? "unknown");
  const traceId = shortId(input.tracingId ?? "unknown");

  const methodPadded = input.method.padEnd(1);
  const routeMax = 50;
  const routeDisplay =
    input.route.length > routeMax
      ? input.route.slice(0, routeMax - 3) + "..."
      : input.route;

  const lines = [
    "",
    `${ANSI.dim}[${serviceName}]${ANSI.reset} ${methodPadded} ${routeDisplay}`,
    `  ${color}${statusStr}${ANSI.reset}  ${ANSI.dim}${duration}  ${size}${ANSI.reset}  ${ANSI.dim}req:${reqId}  trace:${traceId}${ANSI.reset}`,
    `  ${ANSI.dim}${ts}${ANSI.reset}`,
    "",
  ];
  return lines.join("\n");
}

export class Logger {
  private readonly baseContext: { service: string; environment: string };
  // private readonly ingestClient: IngestClient;
  private readonly logFilePath: string | undefined;
  private defaultPayload: LogPayload = {
    requestId: "",
    tracingId: "",
    method: "",
    route: "",
    statusCode: 0,
    durationMs: 0,
    responseSize: 0,
  };
  /** Buffered app logs for the current request; sent with the HTTP log on logHttp(). */
  private appLogBuffer: any[] = [];

  constructor(options: LoggerOptions) {
    this.baseContext = {
      service: options.serviceName,
      environment: options.environment ?? "prod",
    };
    // this.ingestClient = options.ingestClient;
    this.logFilePath = options.logFilePath;
  }

  /** Create requestId and tracingId for a request. Call at request start; attach to req and pass to logHttp(). */
  init(input: InitInput): string {
    const tracingId = randomUUID();
    this.appLogBuffer = [];
    this.defaultPayload = {
      requestId: tracingId,
      tracingId: tracingId,
      method: input.method,
      route: input.route,
      statusCode: 0,
      durationMs: 0,
      responseSize: 0,
    };
    return tracingId;
  }

  private static levelPrefix(level: LogLevel): string {
    switch (level) {
      case "debug":
        return `${ANSI.dim}[DEBUG]${ANSI.reset} `;
      case "info":
        return `${ANSI.green}[INFO]${ANSI.reset} `;
      case "warn":
        return `${ANSI.yellow}[WARN]${ANSI.reset} `;
      case "error":
        return `${ANSI.red}[ERROR]${ANSI.reset} `;
      default:
        return "";
    }
  }

  private log(level: LogLevel, payload: LogPayload): void {
    const logEntry = {
      level,
      ...this.defaultPayload,
      ...this.baseContext,
      ...payload,
    };

    writeLogEntry(this.logFilePath, logEntry as Record<string, unknown>);

    if (this.baseContext.environment === env.LOCAL) {
      const prefix = Logger.levelPrefix(level);
      const json = JSON.stringify(logEntry, null, 2);
      console.log(prefix + highlightJson(json));
    } else {
      console.log(JSON.stringify(logEntry));
    }

    // resetting the app log buffer when http log is logged
    if(payload.type === "http") {
      this.appLogBuffer=[];
    }

    // Ingest: buffer app logs; when type "http" send one batch (HTTP + buffered app logs) then clear buffer.
    // if (payload.type === "http") {
    //   const entry = logEntry as Record<string, unknown>;
    //   const durationMs =
    //     typeof entry.durationMs === "number"
    //       ? entry.durationMs
    //       : 0;
    //   const httpEntry = toIngestLogEntry({
    //     requestId: entry.requestId as string | undefined,
    //     tracingId: entry.tracingId as string | undefined,
    //     method: (entry.method as string) ?? "",
    //     route: (entry.route as string) ?? "",
    //     statusCode: (entry.statusCode as number) ?? 0,
    //     durationMs,
    //     responseSize: entry.responseSize as number | undefined,
    //     timestamp: entry.timestamp as string | undefined,
    //   });
    //   const logsToSend: (typeof httpEntry | IngestAppLogEntry)[] = [httpEntry, ...this.appLogBuffer];
    //   this.appLogBuffer = [];
    //   this.ingestClient
    //     .send({ logs: logsToSend })
    //     .catch((error) => {
    //       console.error(`${LOG_START_PREFIX} ${error.message}`);
    //     });
    // } else {
    //   const appEntry: IngestAppLogEntry = {
    //     type: "app",
    //     tracingId: this.defaultPayload.tracingId as string,
    //     requestId: (this.defaultPayload.requestId as string) || undefined,
    //     level,
    //     message: (payload.message as string) ?? (payload.msg as string),
    //     payload: payload as Record<string, unknown>,
    //     timestamp: new Date().toISOString(),
    //   };
    //   this.appLogBuffer.push(appEntry);
    // }
  }

  debug(payload: LogPayload): void {
    this.log("debug", payload);
  }

  info(payload: LogPayload): void {
    this.log("info", payload);
  }

  warn(payload: LogPayload): void {
    this.log("warn", payload);
  }

  error(payload: LogPayload): void {
    this.log("error", payload);
  }

  /**
   * Log an HTTP request. Uses statusCode to choose level (>= 500 → error).
   * In dev: prints a formatted, scannable block (method, route, status, duration, size, ids).
   * In prod: prints a single JSON line for log aggregators.
   */
  logHttp(input: HttpLogInput): void {
    const timestamp = input.timestamp ?? new Date().toISOString();
    const payload: LogPayload = {
      type: "http",
      ...this.defaultPayload,
      method: input.method,
      route: input.route,
      statusCode: input.statusCode,
      durationMs: Math.round(input.durationMs),
      responseSize: input.responseSize ?? 0,
      timestamp,
    };

    if (this.baseContext.environment === "local") {
      writeLogEntry(this.logFilePath, payload as Record<string, unknown>);
      console.log(
        formatHttpLogDev(this.baseContext.service, { ...input, timestamp }),
      );
      const payloadJson = JSON.stringify(payload, null, 2);
      console.log(
        ANSI.dim + "payload:" + ANSI.reset + "\n" + highlightJson(payloadJson),
      );
    } else {
      if (input.statusCode >= 500) {
        this.error(payload);
      } else if (input.statusCode >= 400) {
        this.warn(payload);
      } else {
        this.info(payload);
      }
    }

  }
}
