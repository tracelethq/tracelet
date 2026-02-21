/**
 * File logging for the logger (Node only).
 * Writes log lines in human-readable format; creates directory and file if missing.
 */

function formatResponseSize(raw: string | number | undefined): string {
  const n = typeof raw === "string" ? parseInt(raw, 10) : Number(raw ?? 0);
  if (!Number.isFinite(n) || n < 0) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} kB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Append a line to a file (Node only). Creates directory and file if needed. No-op in browser or on error. */
export function appendLogLine(filePath: string, line: string): void {
  if (typeof process === "undefined" || !process.versions?.node) return;
  try {
    const fs = require("node:fs") as {
      appendFileSync?: (path: string, data: string, encoding: string) => void;
      mkdirSync?: (path: string, opts: { recursive: boolean }) => void;
    };
    const pathMod = require("node:path") as { dirname: (p: string) => string };
    const dir = pathMod.dirname(filePath);
    if (fs.mkdirSync) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.appendFileSync) {
      fs.appendFileSync(filePath, line, "utf8");
    }
  } catch {
    // File write disabled or failed (e.g. path not writable, not in Node)
  }
}

/** Format a log entry as a single line: [timestamp] LEVEL message or [timestamp] HTTP ... No ANSI. */
export function formatLogLineForFile(entry: Record<string, unknown>): string {
  const ts = (entry.timestamp as string) ?? new Date().toISOString();
  if (entry.type === "http") {
    const method = (entry.method as string) ?? "";
    const route = (entry.route as string) ?? "";
    const status = (entry.statusCode as number) ?? 0;
    const duration = `${Math.round(Number(entry.durationMs) || 0)}ms`;
    const size = formatResponseSize(entry.responseSize as string | number | undefined);
    return `[${ts}] HTTP ${method} ${route} ${status} ${duration} ${size}\n`;
  }
  const level = ((entry.level as string) ?? "info").toUpperCase();
  const message = (entry.message as string) ?? (entry.msg as string) ?? "";
  const skipKeys = new Set([
    "level", "message", "msg", "timestamp", "serviceName", "service", "environment",
    "requestId", "tracingId", "method", "route", "statusCode", "durationMs", "responseSize", "type",
  ]);
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(entry)) {
    if (!skipKeys.has(k) && v !== undefined) rest[k] = v;
  }
  const restStr = Object.keys(rest).length > 0 ? " " + JSON.stringify(rest) : "";
  return `[${ts}] ${level} ${message}${restStr}\n`;
}

/** Write a log entry to the file (format + append). No-op when filePath is empty or not in Node. */
export function writeLogEntry(filePath: string | undefined, entry: Record<string, unknown>): void {
  if (!filePath) return;
  appendLogLine(filePath, formatLogLineForFile(entry));
}
