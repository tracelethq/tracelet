import { env } from "../lib/constants";
import { FileLogWriter } from "./log-writer";

export interface LoggerOptions {
  environment?: string;
  logFilePath?: string;
  debugMode?: boolean;
}

export interface LogPayload {
  [key: string]: unknown;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

/** Input for HTTP request logging. Pass raw values; use Logger.createRequestIds() for requestId/tracingId. */
export interface HttpLogInput {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  responseSize?: string | number;
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
  primary: "\u001b[38;2;59;115;191m",
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

/**
 * Formatted HTTP log for dev: one scannable block so backend devs see method, route,
 * status, duration, size, and ids at a glance.
 */
function formatHttpLogDev(input: HttpLogInput): string {
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

  const lines = [
    `${ANSI.reset}${ANSI.primary}[Tracelet] ${color}${statusStr}${ANSI.reset}  ${ANSI.dim}${duration}  ${size}${ANSI.reset}`,
  ];
  return lines.join("\n");
}

export class Logger {
  private readonly baseContext: { environment: string };
  private readonly logFilePath: string | undefined;
  private readonly logWriter: FileLogWriter;
  private readonly debugMode: boolean;
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

  constructor(options: LoggerOptions) {
    this.baseContext = {
      environment: options.environment ?? "prod",
    };
    this.logFilePath = options.logFilePath;
    this.debugMode = options.debugMode ?? false;
    this.logWriter = new FileLogWriter();
  }

  /** Create requestId and tracingId for a request. Call at request start; attach to req and pass to logHttp(). */
  init(input: InitInput): string {
    const tracingId = randomUUID();
    const timestamp = new Date().toISOString();
    this.defaultPayload = {
      requestId: tracingId,
      tracingId: tracingId,
      method: input.method,
      route: input.route,
      statusCode: 0,
      durationMs: 0,
      responseSize: 0,
      timestamp: timestamp,
    };
    // Log the initial HTTP log for the request
    console.log(Logger.initHttpLog(this.defaultPayload));

    return tracingId;
  }

  private static levelPrefix(level: LogLevel): string {
    switch (level) {
      case "debug":
        return `${ANSI.dim}[DEBUG] `;
      case "info":
        return `${ANSI.green}[INFO] `;
      case "warn":
        return `${ANSI.yellow}[WARN] `;
      case "error":
        return `${ANSI.red}[ERROR] `;
      default:
        return "";
    }
  }

  private static initHttpLog(input: any): string {
    const methodPadded = input.method.padEnd(1);
    const routeMax = 50;
    const routeDisplay =
      input.route.length > routeMax
        ? input.route.slice(0, routeMax - 3) + "..."
        : input.route;
    return `${ANSI.dim}[${input.timestamp}]${ANSI.reset} ${methodPadded} ${routeDisplay} ${ANSI.dim}[trace:${input.tracingId}]${ANSI.reset}`;
  }

  private log(level: LogLevel, payload: LogPayload | string): void {
    const normalized = typeof payload === "object" && payload.type === "http" ? payload  : { traceletLog: payload };
    const logEntry = {
      level,
      ...this.defaultPayload,
      ...this.baseContext,
      ...normalized,
    };

    this.logWriter.writeEntry(this.logFilePath, logEntry);
    if (!this.debugMode) {
      return;
    }
    if (this.baseContext.environment === env.LOCAL) {
      const prefix = Logger.levelPrefix(level);
      const json = JSON.stringify(payload, null, 2);
      console.log(prefix + highlightJson(json));
    } else {
      console.log(JSON.stringify(payload));
    }
  }

  debug(payload: LogPayload | string): void {
    this.log("debug", payload);
  }

  info(payload: LogPayload | string): void {
    this.log("info", payload);
  }

  warn(payload: LogPayload | string): void {
    this.log("warn", payload);
  }

  error(payload: LogPayload | string): void {
    this.log("error", payload);
  }

  /**
   * Log an HTTP request. Uses statusCode to choose level (>= 500 → error).
   * In dev: prints a formatted, scannable block (method, route, status, duration, size, ids).
   * In prod: prints a single JSON line for log aggregators.
   */
  logHttp(input: HttpLogInput): void {
    const payload: LogPayload = {
      type: "http",
      method: input.method,
      route: input.route,
      statusCode: input.statusCode,
      durationMs: Math.round(input.durationMs),
      responseSize: input.responseSize ?? 0,
    };
    if (this.baseContext.environment === env.LOCAL) {
      console.log(formatHttpLogDev(input));
    }
    if (input.statusCode >= 500) {
      this.error(payload);
    } else if (input.statusCode >= 400) {
      this.warn(payload);
    } else {
      this.info(payload);
    }
  }
}
