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

export type LogEntryInput = Record<string, unknown>;


function isNode(): boolean {
  return typeof process !== "undefined" && !!process.versions?.node;
}

export class FileLogWriter {
  private getFs(): {
    appendFileSync?: (path: string, data: string, encoding: string) => void;
    mkdirSync?: (path: string, opts: { recursive: boolean }) => void;
  } | null {
    if (!isNode()) return null;
    try {
      return require("node:fs") as any;
    } catch {
      return null;
    }
  }

  private getPath(): { dirname: (p: string) => string } | null {
    if (!isNode()) return null;
    try {
      return require("node:path") as any;
    } catch {
      return null;
    }
  }

  /** Append a raw line to a file. Creates directory and file if needed. No-op when not in Node or on error. */
  appendLine(filePath: string, line: string): void {
    const fs = this.getFs();
    const pathMod = this.getPath();
    if (!fs?.appendFileSync || !pathMod) return;
    try {
      const dir = pathMod.dirname(filePath);
      if (fs.mkdirSync) fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(filePath, line, "utf8");
    } catch {
      // File write disabled or failed
    }
  }

  /**
   * Format a log entry as a single line. No fields are skipped — full payload is appended as JSON.
   */
  formatLine(entry: LogEntryInput): string {
    const ts = (entry.timestamp as string) ?? new Date().toISOString();
    if (entry.type === "http") {
      const method = (entry.method as string) ?? "";
      const route = (entry.route as string) ?? "";
      const status = (entry.statusCode as number) ?? 0;
      const duration = `${Math.round(Number(entry.durationMs) || 0)}ms`;
      const size = formatResponseSize(
        entry.responseSize as string | number | undefined,
      );
      return `[${ts}] HTTP ${method} ${route} ${status} ${duration} ${size} ${JSON.stringify(entry)}\n`;
    }
    const level = ((entry.level as string) ?? "info").toUpperCase();
    return `[${ts}] ${level} ${JSON.stringify(entry)}\n`;
  }

  /** Write a log entry to the file (format + append). No-op when filePath is empty or not in Node. */
  writeEntry(filePath: string | undefined, entry: LogEntryInput): void {
    if (!filePath) return;
    this.appendLine(filePath, this.formatLine(entry));
  }
}