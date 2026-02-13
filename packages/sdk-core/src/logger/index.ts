export interface LoggerOptions {
  serviceName: string
  environment?: string
}

export interface LogPayload {
  [key: string]: unknown
}

export type LogLevel = "debug" | "info" | "warn" | "error"

/** IDs for a single request/trace. Create via Logger.createRequestIds(); do not create in framework code. */
export interface RequestIds {
  requestId: string
  tracingId: string
}

/** Input for HTTP request logging. Pass raw values; use Logger.createRequestIds() for requestId/tracingId. */
export interface HttpLogInput {
  requestId: string
  tracingId: string
  method: string
  route: string
  statusCode: number
  durationMs: number
  responseSize?: string | number
  timestamp?: string
}

function randomUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
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
} as const

/**
 * Colorize a pretty-printed JSON string for terminal output (keys, strings, numbers, literals).
 */
function highlightJson(jsonStr: string): string {
  return jsonStr
    .replace(/^(\s*)("(?:[^"\\]|\\.)*")(\s*:)/gm, (_, space, key, colon) => {
      return `${space}${ANSI.cyan}${key}${ANSI.reset}${colon}`
    })
    .replace(/: (\d+\.?\d*)/g, (m) => `: ${ANSI.yellow}${m.slice(2)}${ANSI.reset}`)
    .replace(/: (true|false|null)\b/g, (m) => `: ${ANSI.magenta}${m.slice(2)}${ANSI.reset}`)
    .replace(/: ("(?:[^"\\]|\\.)*")/g, (m) => {
      const value = m.slice(2)
      return `: ${ANSI.green}${value}${ANSI.reset}`
    })
}

function formatResponseSize(raw: string | number | undefined): string {
  const n = typeof raw === "string" ? parseInt(raw, 10) : Number(raw ?? 0)
  if (!Number.isFinite(n) || n < 0) return "0 B"
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} kB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function statusColor(code: number): string {
  if (code >= 500) return ANSI.red
  if (code >= 400) return ANSI.yellow
  if (code >= 300) return ANSI.cyan
  return ANSI.green
}

function shortId(id: string): string {
  return id.length >= 8 ? id.slice(0, 8) : id
}

/**
 * Formatted HTTP log for dev: one scannable block so backend devs see method, route,
 * status, duration, size, and ids at a glance.
 */
function formatHttpLogDev(serviceName: string, input: HttpLogInput): string {
  const ts = input.timestamp ?? new Date().toISOString()
  const size = formatResponseSize(input.responseSize)
  const duration = `${Math.round(input.durationMs)}ms`
  const status = input.statusCode
  const statusLabel =
    status >= 500 ? "ERROR" : status >= 400 ? "CLIENT_ERR" : status >= 300 ? "REDIRECT" : "OK"
  const statusStr = `${status} ${statusLabel}`
  const color = statusColor(status)
  const reqId = shortId(input.requestId)
  const traceId = shortId(input.tracingId)

  const methodPadded = input.method.padEnd(6)
  const routeMax = 50
  const routeDisplay =
    input.route.length > routeMax ? input.route.slice(0, routeMax - 3) + "..." : input.route

  const lines = [
    "",
    `${ANSI.dim}[${serviceName}]${ANSI.reset} ${methodPadded} ${routeDisplay}`,
    `  ${color}${statusStr}${ANSI.reset}  ${ANSI.dim}${duration}  ${size}${ANSI.reset}  ${ANSI.dim}req:${reqId}  trace:${traceId}${ANSI.reset}`,
    `  ${ANSI.dim}${ts}${ANSI.reset}`,
    "",
  ]
  return lines.join("\n")
}

export class Logger {
  private readonly baseContext: { service: string; environment: string }

  constructor(options: LoggerOptions) {
    this.baseContext = {
      service: options.serviceName,
      environment: options.environment ?? "prod",
    }
  }

  /** Create requestId and tracingId for a request. Call at request start; attach to req and pass to logHttp(). */
  createTracingId(): string {
    return randomUUID()
  }

  private static levelPrefix(level: LogLevel): string {
    switch (level) {
      case "debug":
        return `${ANSI.dim}[DEBUG]${ANSI.reset} `
      case "info":
        return `${ANSI.green}[INFO]${ANSI.reset} `
      case "warn":
        return `${ANSI.yellow}[WARN]${ANSI.reset} `
      case "error":
        return `${ANSI.red}[ERROR]${ANSI.reset} `
      default:
        return ""
    }
  }

  private log(level: LogLevel, payload: LogPayload): void {
    const logEntry = {
      level,
      ...this.baseContext,
      ...payload,
    }

    if (this.baseContext.environment === "dev") {
      const prefix = Logger.levelPrefix(level)
      const json = JSON.stringify(logEntry, null, 2)
      console.log(prefix + highlightJson(json))
    } else {
      console.log(JSON.stringify(logEntry))
    }
  }

  debug(payload: LogPayload): void {
    this.log("debug", payload)
  }

  info(payload: LogPayload): void {
    this.log("info", payload)
  }

  warn(payload: LogPayload): void {
    this.log("warn", payload)
  }

  error(payload: LogPayload): void {
    this.log("error", payload)
  }

  /**
   * Log an HTTP request. Uses statusCode to choose level (>= 500 → error).
   * In dev: prints a formatted, scannable block (method, route, status, duration, size, ids).
   * In prod: prints a single JSON line for log aggregators.
   */
  logHttp(input: HttpLogInput): void {
    const timestamp = input.timestamp ?? new Date().toISOString()
    const payload: LogPayload = {
      type: "http",
      requestId: input.requestId,
      tracingId: input.tracingId,
      method: input.method,
      route: input.route,
      statusCode: input.statusCode,
      duration_ms: Math.round(input.durationMs),
      responseSize: input.responseSize ?? 0,
      timestamp,
    }

    if (this.baseContext.environment === "dev") {
      console.log(formatHttpLogDev(this.baseContext.service, { ...input, timestamp }))
      const payloadJson = JSON.stringify(payload, null, 2)
      console.log(ANSI.dim + "payload:" + ANSI.reset + "\n" + highlightJson(payloadJson))
    } else {
      if (input.statusCode >= 500) {
        this.error(payload)
      } else if (input.statusCode >= 400) {
        this.warn(payload)
      } else {
        this.info(payload)
      }
    }
  }
}

/** Create a Logger instance. Framework SDKs use this and call logger.logHttp() with raw values. */
export function createLogger(options: LoggerOptions): Logger {
  return new Logger(options)
}
