/**
 * Efficient log file reading (Node only). Streams or reads from the end to handle large files without loading them fully into memory.
 */

export interface RequestLogEntry {
  raw?: string;
  requestId?: string;
  tracingId?: string;
  timestamp?: string;
  method?: string;
  route?: string;
  statusCode?: number;
  durationMs?: number;
  responseSize?: number | string;
  level?: string;
  message?: string;
  type?: string;
  [key: string]: unknown;
}

const DEFAULT_TAIL_BYTES = 512 * 1024; // 512 KB for tail

export interface LogReaderOptions {
  /** Max bytes to read from the end when using tail (default 512 KB). */
  defaultTailBytes?: number;
}

function isNode(): boolean {
  return typeof process !== "undefined" && !!process.versions?.node;
}

type FsModule = {
  createReadStream: (
    path: string,
    opts?: { start?: number; end?: number; encoding?: BufferEncoding },
  ) => NodeJS.ReadableStream;
  statSync: (path: string) => { size: number };
  openSync: (path: string, flags: string) => number;
  readSync: (
    fd: number,
    buffer: Buffer,
    offset: number,
    length: number,
    position: number,
  ) => number;
  closeSync: (fd: number) => void;
} | null;

export class LogReader {
  private readonly defaultTailBytes: number;

  constructor(options: LogReaderOptions = {}) {
    this.defaultTailBytes = options.defaultTailBytes ?? DEFAULT_TAIL_BYTES;
  }

  private getFs(): FsModule {
    if (!isNode()) return null;
    try {
      return require("node:fs") as FsModule;
    } catch {
      return null;
    }
  }

  /**
   * Read the last N lines from a log file without loading the entire file.
   * Reads only the last tailBytes from the file. Efficient for large files.
   */
  readLastLinesSync({
    filePath,
    maxLines,
    tailBytes = this.defaultTailBytes,
    page,
    limit,
    type,
    level,
    search,
  }: {
    filePath: string;
    maxLines: number;
    tailBytes?: number;
    page?: number;
    limit?: number;
    type?: string;
    level?: string;
    search?: string;
  }): { total: number; logs: RequestLogEntry[] } {
    const fs = this.getFs();
    if (!fs) return { total: 0, logs: [] };
    try {
      const stat = fs.statSync(filePath);
      if (stat.size === 0) return { total: 0, logs: [] };
      const bytesToRead = Math.min(tailBytes, stat.size);
      const start = stat.size - bytesToRead;
      const buf = Buffer.alloc(bytesToRead);
      const fd = fs.openSync(filePath, "r");
      try {
        fs.readSync(fd, buf, 0, bytesToRead, start);
      } finally {
        fs.closeSync(fd);
      }
      const text = buf.toString("utf8");
      const lines = text
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0);
      return this.formatLogEntry({ lines, maxLines, type, level, search, page, limit });
    } catch {
      return { total: 0, logs: [] };
    }
  }

  /**
   * Async: read the last N lines by reading the last tailBytes. Efficient for large files.
   */
  readLastLines({
    filePath,
    maxLines,
    tailBytes = this.defaultTailBytes,
    page,
    limit,
    type,
    level,
    search,
  }: {
    filePath: string;
    maxLines: number;
    tailBytes?: number;
    page?: number;
    limit?: number;
    type?: string;
    level?: string;
    search?: string;
  }): Promise<{ total: number; logs: RequestLogEntry[] }> {
    const fs = this.getFs();
    if (!fs) return Promise.resolve({ total: 0, logs: [] });
    return new Promise((resolve) => {
      try {
        const stat = fs.statSync(filePath);
        if (stat.size === 0) {
          resolve({ total: 0, logs: [] });
          return;
        }
        const bytesToRead = Math.min(tailBytes, stat.size);
        const start = stat.size - bytesToRead;
        const stream = fs.createReadStream(filePath, {
          start,
          end: stat.size - 1,
          encoding: "utf8",
        });
        let buf = "";
        stream.on("data", (chunk: string) => {
          buf += chunk;
        });
        stream.on("end", () => {
          const lines = buf
            .split(/\r?\n/)
            .filter((line) => line.trim().length > 0);
          // resolve(lines.slice(-maxLines));
          resolve(
            this.formatLogEntry({
              lines: lines,
              maxLines,
              type,
              level,
              search,
              page,
              limit,
            }),
          );
        });
        stream.on("error", () => resolve({ total: 0, logs: [] }));
      } catch {
        resolve({ total: 0, logs: [] });
      }
    });
  }

  /**
   * Stream log file line-by-line from the start (async iterable). Memory-efficient for large files.
   * Optional limit stops after that many lines.
   */
  async *streamLogLines(
    filePath: string,
    options?: { limit?: number },
  ): AsyncGenerator<string, void, unknown> {
    const fs = this.getFs();
    if (!fs) return;
    let readline: {
      createInterface: (opts: {
        input: NodeJS.ReadableStream;
        crlfDelay?: number;
      }) => AsyncIterable<string>;
    } | null = null;
    try {
      readline = require("node:readline") as any;
    } catch {
      return;
    }
    if (!readline) return;
    const limit = options?.limit ?? Infinity;
    const stream = fs.createReadStream(filePath, { encoding: "utf8" });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    let count = 0;
    for await (const line of rl) {
      if (line.trim().length === 0) continue;
      count++;
      if (count > limit) break;
      yield line;
    }
  }
  safeJsonParse(s: string): Record<string, unknown> | null {
    try {
      const v = JSON.parse(s);
      return typeof v === "object" && v !== null
        ? (v as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }

  /**
   * Create the logs router. GET /logs supports query: limit, page, type, level, search.
   * Returns groups of entries by requestId/tracingId (one "log" per trace), paginated.
   */

  /** Parse a single log line: extract only the trailing JSON and use it as the entry. */
  parseLogLine(raw: string, index: number): RequestLogEntry | null {
    const jsonStart = raw.indexOf(" {");
    if (jsonStart < 0) return null;
    const obj = this.safeJsonParse(raw.slice(jsonStart + 1));
    if (!obj) return null;
    const entry: RequestLogEntry = { ...obj, raw };
    entry.requestId = (entry.requestId ??
      entry.tracingId ??
      `req-${index}`) as string;
    return entry;
  }

  filterEntry(
    entry: RequestLogEntry,
    type: string,
    level: string,
    search: string,
  ): boolean {
    const isHttp =
      entry.type === "http";
    if (type === "http" && !isHttp) return false;
    if (type === "app" && isHttp) return false;
    if (level !== "all" && level !== "") {
      if ((entry.level ?? "").toUpperCase() !== level) return false;
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const searchable = [
        entry.method,
        entry.route,
        entry.message,
        entry.raw,
        entry.level,
        entry.timestamp,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  }

  formatLogEntry({
    lines,
    maxLines,
    type = "all",
    level = "all",
    search = "",
    page = 1,
    limit = 100,
  }: {
    lines: string[];
    maxLines: number;
    type?: string;
    level?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): { total: number; logs: RequestLogEntry[] } {
    const logLines = lines.slice(-maxLines);
    const entries = logLines
      .map((line, i) => this.parseLogLine(line, i))
      .filter((e): e is RequestLogEntry => e != null);
    const filtered = entries.filter((e) =>
      this.filterEntry(e, type, level, search),
    );

    let orphanIndex = 0;
    const byGroup = new Map<string, RequestLogEntry[]>();
    for (const e of filtered) {
      const key = e.requestId ?? e.tracingId ?? "";
      const groupId = key || `orphan-${orphanIndex++}`;
      if (!byGroup.has(groupId)) byGroup.set(groupId, []);
      byGroup.get(groupId)!.push(e);
    }
    const groups = Array.from(byGroup.entries()).map(
      ([requestId, entries]) => ({
        requestId,
        entries,
      }),
    );
    groups.sort((a, b) => {
      const ta = a.entries[0]?.timestamp ?? "";
      const tb = b.entries[0]?.timestamp ?? "";
      return tb.localeCompare(ta);
    });
    const total = groups.length;
    const start = (page - 1) * limit;
    const pageGroups = groups.slice(start, start + limit);
    return { total, logs: pageGroups };
  }
}
