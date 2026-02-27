import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  FileTextIcon,
  Loader2Icon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JsonHighlight } from "@/components/api-explorer/api-details/json-highlight";
import { cn } from "@/lib/utils";
import Decorations from "@/components/ui/decorations";

/** Log entry from API (from parsed JSON): HTTP (type "http") or app (level, traceletLog). */
export interface RequestLogEntry {
  id?: string;
  requestId?: string;
  tracingId?: string;
  raw?: string;
  timestamp?: string;
  createdAt?: string;
  type?: string;
  method?: string;
  route?: string;
  statusCode?: number;
  durationMs?: number;
  responseSize?: number | string;
  level?: string;
  message?: string;
  /** App log: string or object from logger */
  traceletLog?: string | Record<string, unknown>;
  [key: string]: unknown;
}

/** One log = one trace/request: requestId + entries. */
export interface LogGroup {
  requestId: string;
  entries: RequestLogEntry[];
}

interface LogsApiResponse {
  groups: LogGroup[];
  total: number;
  page: number;
  limit: number;
}

interface LogsViewProps {
  /** Same base as routes, e.g. ${baseUrl}/${apiRoutePath}/logs */
  logsUrl: string;
  /** Auth token (same as routes); optional */
  token?: string | null;
}

const PAGE_SIZE = 50;

function buildLogsUrl(
  base: string,
  page: number,
  type: string,
  level: string,
  search: string,
): string {
  const q = new URLSearchParams();
  q.set("limit", String(PAGE_SIZE));
  q.set("page", String(page));
  if (type !== "all") q.set("type", type);
  if (level !== "all") q.set("level", level);
  if (search.trim()) q.set("search", search.trim());
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${q.toString()}`;
}

async function fetchLogs(
  url: string,
  token: string | null | undefined,
): Promise<LogsApiResponse> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    headers: Object.keys(headers).length ? headers : undefined,
  });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.groups && typeof data.total === "number") {
    return {
      groups: data.groups,
      total: data.total,
      page: data.page ?? 1,
      limit: data.limit ?? PAGE_SIZE,
    };
  }
  return { groups: [], total: 0, page: 1, limit: PAGE_SIZE };
}

export function LogsView({ logsUrl, token }: LogsViewProps) {
  const [filterType, setFilterType] = React.useState<"all" | "http" | "app">(
    "all",
  );
  const [filterLevel, setFilterLevel] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  const url = buildLogsUrl(logsUrl, page, filterType, filterLevel, searchQuery);
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["logs", url],
    queryFn: () => fetchLogs(url, token ?? null),
    enabled: !!logsUrl,
    placeholderData: keepPreviousData,
  });

  const groups = data?.groups ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const limit = data?.limit ?? PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasPagination = total > limit;
  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <Empty className="border max-w-md">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>Could not load logs</EmptyTitle>
            <EmptyDescription>
              {error instanceof Error ? error.message : "Something went wrong."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCwIcon
                className={isRefetching ? "size-4 animate-spin" : "size-4"}
              />
              {isRefetching ? "Retrying…" : "Retry"}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto max-h-[calc(100vh-var(--header-height))] px-2">
      {isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground p-4 absolute inset-0 z-20">
          <Loader2Icon className="size-8 animate-spin" />
          <p className="text-sm">Loading logs…</p>
        </div>
      )}
      <div className="sticky top-0 z-20 flex flex-col gap-2 border border-border bg-background">
        <div className="flex items-center justify-between gap-2 relative px-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filterType}
              onValueChange={(v: "all" | "http" | "app") => {
                setFilterType(v);
                setPage(1);
              }}
            >
              <SelectTrigger size="sm" className="w-[100px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="http">HTTP</SelectItem>
                <SelectItem value="app">App</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterLevel}
              onValueChange={(v) => {
                setFilterLevel(v);
                setPage(1);
              }}
            >
              <SelectTrigger size="sm" className="w-[100px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="DEBUG">DEBUG</SelectItem>
                <SelectItem value="INFO">INFO</SelectItem>
                <SelectItem value="WARN">WARN</SelectItem>
                <SelectItem value="ERROR">ERROR</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[120px] max-w-[200px]">
              <SearchIcon className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="h-7 pl-7"
              />
            </div>
          </div>
          <Decorations className="h-0 w-0" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCwIcon
              className={cn("size-4", isRefetching && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>
      <div className="flex-1 pb-px">
        {groups.length === 0 ? (
          <div className="flex flex-1 flex-col overflow-hidden p-4">
            <Empty className="border flex-1 min-h-0 flex flex-col">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileTextIcon />
                </EmptyMedia>
                <EmptyTitle>Request logs</EmptyTitle>
                <EmptyDescription>
                  No logs found. HTTP request logs from your app will appear
                  here when ingest is configured and the SDK is sending data to
                  the backend.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <ul className="border divide-y divide-border relative">
            <Decorations />
            {groups.map((group) => (
              <LogGroupRow key={group.requestId} group={group} />
            ))}
          </ul>
        )}
      </div>
      {hasPagination && (
        <div className="sticky bottom-0 bg-background pb-px z-20">
          <div className="flex items-center justify-between gap-2 relative border px-4 py-2 text-sm text-muted-foreground ">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Decorations />
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatResponseSize(raw: number | string | undefined): string {
  const n = typeof raw === "string" ? parseInt(raw, 10) : Number(raw ?? 0);
  if (!Number.isFinite(n) || n < 0) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} kB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function statusLabel(code: number): string {
  if (code >= 500) return "ERROR";
  if (code >= 400) return "CLIENT_ERR";
  if (code >= 300) return "REDIRECT";
  return "OK";
}

/** Pick HTTP entry from group for header summary, or null. */
function getHeaderEntry(entries: RequestLogEntry[]): RequestLogEntry | null {
  const http = entries.find(
    (e) =>
      e.type === "http" &&
      e.method != null &&
      e.route != null &&
      e.statusCode != null,
  );
  return http ?? entries[0] ?? null;
}

/** Collapsible button shows this 2-line terminal summary. */
function GroupHeaderSummary({ group }: { group: LogGroup }) {
  const entry = getHeaderEntry(group.entries);
  if (!entry) return <span className="text-zinc-500">—</span>;
  const isHttp =
    entry.type === "http" ||
    (entry.method != null && entry.route != null && entry.statusCode != null);
  const ts = entry.timestamp ?? entry.createdAt ?? "—";
  const traceId = (entry.tracingId ?? entry.requestId ?? "").toString();

  if (
    isHttp &&
    entry.method != null &&
    entry.route != null &&
    entry.statusCode != null
  ) {
    const code = Number(entry.statusCode);
    const label = statusLabel(code);
    const duration = entry.durationMs != null ? `${entry.durationMs}ms` : "—";
    const size = formatResponseSize(entry.responseSize);
    const statusClass =
      code >= 500
        ? "text-red-400"
        : code >= 400
          ? "text-amber-400"
          : "text-emerald-400";
    return (
      <span className="flex items-center justify-between font-mono text-xs text-left">
        <span>
          <span className="text-zinc-500">[{ts}] </span>
          <span className="text-cyan-300">{entry.method}</span>
          <span className="text-zinc-400"> {entry.route}</span>
          <span className={cn("tabular-nums", statusClass)}>
            {" "}
            {code} {label}
          </span>
          <span className="text-zinc-500">
            {" "}
            {duration} {size}
          </span>
        </span>
        {traceId && <span className="text-primary/80"> [trace:{traceId}]</span>}
      </span>
    );
  }

  const level = (entry.level ?? "INFO").toString().toUpperCase();
  const levelColor =
    level === "ERROR"
      ? "text-red-400"
      : level === "WARN"
        ? "text-amber-400"
        : "text-zinc-400";
  const msg = entry.traceletLog ?? entry.message ?? entry.raw ?? "—";
  const msgStr = typeof msg === "string" ? msg : JSON.stringify(msg);
  return (
    <span className="block font-mono text-xs text-left">
      <span className={cn("uppercase", levelColor)}>[{level}] </span>
      <span className="text-zinc-300">
        {msgStr.startsWith("{") ? msgStr : `"${msgStr}"`}
      </span>
    </span>
  );
}

/** Payload when expanded: http = full payload minus header fields; app = [LEVEL] + traceletLog (string and/or object). */
function EntryPayload({ log }: { log: RequestLogEntry }) {
  const isHttp = log.type === "http";
  const level = (log.level ?? "INFO").toString().toUpperCase();
  const levelColor =
    level === "ERROR"
      ? "text-red-400"
      : level === "WARN"
        ? "text-amber-400"
        : "text-zinc-400";

  if (isHttp) {
    const omit = new Set([
      "tracingId",
      "requestId",
      "timestamp",
      "method",
      "route",
      "level",
      "type",
      "environment",
    ]);
    const payload = Object.fromEntries(
      Object.entries(log).filter(
        ([k, v]) => !omit.has(k) && k !== "raw" && v !== undefined,
      ),
    );
    const json = JSON.stringify(payload, null, 2);
    return (
      <span className={levelColor}>
        <span className={cn("uppercase text-primary")}>[Tracelet] </span>
        <JsonHighlight className="text-foreground whitespace-pre-wrap font-mono text-xs block">
          {json}
        </JsonHighlight>
      </span>
    );
  }

  const traceletLog = log.traceletLog;
  const hasString = typeof traceletLog === "string";
  const hasObject =
    typeof traceletLog === "object" &&
    traceletLog !== null &&
    !Array.isArray(traceletLog);
  return (
    <span className="block font-mono text-xs">
      {hasString && (
        <span className={levelColor}>
          <span className={cn("uppercase", levelColor)}>[{level}] </span>
          <span>"{traceletLog}"</span>
          <br />
        </span>
      )}
      {hasObject && (
        <span className={levelColor}>
          <span className={cn("uppercase", levelColor)}>[{level}] </span>
          <br />
          <JsonHighlight className="whitespace-pre-wrap block">
            {JSON.stringify(traceletLog, null, 2)}
          </JsonHighlight>
        </span>
      )}
      {!hasString && !hasObject && (
        <span className={levelColor}>
          <span className={cn("uppercase", levelColor)}>[{level}] </span>
          <span>{log.message ?? log.raw ?? "—"}</span>
        </span>
      )}
    </span>
  );
}

/** One log block = one trace/request. Collapsed: 2-line terminal summary. Expanded: payloads per entry. */
function LogGroupRow({ group }: { group: LogGroup }) {
  return (
    <li className="flex flex-col">
      <div className="flex w-full items-start gap-2 rounded-none border-0 text-zinc-100 px-4 py-3 text-left">
        <span className="flex-1 min-w-0">
          <GroupHeaderSummary group={group} />
        </span>
      </div>
      <div className="overflow-x-auto">
        <pre className="font-mono text-xs leading-relaxed p-4 pt-0 space-y-3">
          {group.entries.map((log, i) => (
            <span key={i} className="block">
              <EntryPayload log={log} />
            </span>
          ))}
        </pre>
      </div>
    </li>
  );
}
