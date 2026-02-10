export interface LoggerOptions {
  serviceName: string
  environment?: string
}

export interface LogPayload {
  [key: string]: unknown
}

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
  private log(level: "info" | "error", payload: LogPayload): void {
    const logEntry = {
      level,
      ...this.baseContext,
      ...payload,
    }

    if (this.baseContext.environment === "dev") {
      console.log(level.toUpperCase(), logEntry)
    } else {
      console.log(JSON.stringify(logEntry))
    }
  }

  info(payload: LogPayload): void {
    this.log("info", payload)
  }

  error(payload: LogPayload): void {
    this.log("error", payload)
  }

  /**
   * Log an HTTP request. Uses statusCode to choose level (>= 500 → error).
   * Framework SDKs pass raw values; this class handles payload shape and output.
   */
  logHttp(input: HttpLogInput): void {
    const payload: LogPayload = {
      type: "http",
      requestId: input.requestId,
      tracingId: input.tracingId,
      method: input.method,
      route: input.route,
      statusCode: input.statusCode,
      duration_ms: Math.round(input.durationMs),
      responseSize: input.responseSize ?? 0,
      timestamp: input.timestamp ?? new Date().toISOString(),
    }

    if (input.statusCode >= 500) {
      this.error(payload)
    } else {
      this.info(payload)
    }
  }
}

/** Create a Logger instance. Framework SDKs use this and call logger.logHttp() with raw values. */
export function createLogger(options: LoggerOptions): Logger {
  return new Logger(options)
}
