"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useProjectsQuery } from "@/features/project";
import { useLogsInfiniteQuery, useAppLogsQuery, type LogsFilters, type RequestLogItem, type AppLogItem } from "@/features/logs";
import { ENV_OPTIONS } from "@/features/project/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollText, Loader2, Terminal } from "lucide-react";

const METHOD_OPTIONS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;
const PAGE_SIZE = 50;

const TIME_PERIOD_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "1h", label: "Last 1 hour" },
  { value: "6h", label: "Last 6 hours" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
] as const;

function getDateRangeForPeriod(period: string): { dateFrom?: string; dateTo?: string } {
  if (!period || period === "all") return {};
  const now = Date.now();
  let ms = 0;
  if (period === "1h") ms = 60 * 60 * 1000;
  else if (period === "6h") ms = 6 * 60 * 60 * 1000;
  else if (period === "24h") ms = 24 * 60 * 60 * 1000;
  else if (period === "7d") ms = 7 * 24 * 60 * 60 * 1000;
  else if (period === "30d") ms = 30 * 24 * 60 * 60 * 1000;
  else return {};
  return {
    dateFrom: new Date(now - ms).toISOString(),
    dateTo: new Date(now).toISOString(),
  };
}

function formatDateTime(v: string | undefined): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-emerald-400";
  if (status >= 300 && status < 400) return "text-amber-400";
  if (status >= 400) return "text-red-400";
  return "text-zinc-500";
}

function formatTerminalDateTime(v: string | undefined): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  const date = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${date} ${time}`;
}

function appLogLevelColor(level: string): string {
  switch (level) {
    case "error":
      return "text-red-400";
    case "warn":
      return "text-amber-400";
    case "info":
      return "text-emerald-400";
    case "debug":
      return "text-zinc-500";
    default:
      return "text-zinc-400";
  }
}

function AppLogRow({ log }: { log: AppLogItem }) {
  const hasPayload = log.payload != null && typeof log.payload === "object" && Object.keys(log.payload as object).length > 0;
  return (
    <li className="rounded border border-border/50 bg-muted/30 p-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="shrink-0 text-zinc-500">
          [{formatTerminalDateTime(log.timestamp)}]
        </span>
        <span className={`shrink-0 font-semibold uppercase ${appLogLevelColor(log.level)}`}>
          {log.level}
        </span>
        {log.message != null && log.message !== "" && (
          <span className="min-w-0 text-zinc-300">{log.message}</span>
        )}
      </div>
      {hasPayload && (
        <pre className="mt-1.5 overflow-x-auto rounded bg-background/60 p-1.5 text-[11px] text-zinc-400">
          {JSON.stringify(log.payload, null, 2)}
        </pre>
      )}
    </li>
  );
}

export default function LogsPage() {
  const params = useParams();
  const projectSlug = params.projectSlug as string;
  const envFromUrl = (params.environment as string) ?? "development";
  const currentEnvId = ENV_OPTIONS.some((e) => e.id === envFromUrl)
    ? envFromUrl
    : ENV_OPTIONS[0].id;

  const { data: projects, isLoading: projectsLoading } = useProjectsQuery();
  const project = projects?.find((p) => p.slug === projectSlug);
  const organizationId = project?.id;

  const [method, setMethod] = useState<string>("");
  const [statusCode, setStatusCode] = useState<string>("");
  const [routeSearch, setRouteSearch] = useState("");
  const [tracingId, setTracingId] = useState("");
  const [timePeriod, setTimePeriod] = useState<string>("24h");
  const [appliedFilters, setAppliedFilters] = useState<Omit<LogsFilters, "cursor">>(() =>
    getDateRangeForPeriod("24h")
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollToBottomRef = useRef(true);

  const filters = useMemo(
    () => ({
      ...appliedFilters,
      limit: PAGE_SIZE,
    }),
    [appliedFilters]
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isFetching,
    error,
    fetchNextPage,
    hasNextPage,
  } = useLogsInfiniteQuery(organizationId, currentEnvId, filters);

  const applyFilters = () => {
    const { dateFrom, dateTo } = getDateRangeForPeriod(timePeriod);
    setAppliedFilters({
      method: method.trim() || undefined,
      statusCode: statusCode.trim() ? parseInt(statusCode.trim(), 10) : undefined,
      route: routeSearch.trim() || undefined,
      tracingId: tracingId.trim() || undefined,
      dateFrom,
      dateTo,
    });
  };

  const resetFilters = () => {
    setMethod("");
    setStatusCode("");
    setRouteSearch("");
    setTracingId("");
    setTimePeriod("all");
    setAppliedFilters({});
  };

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items),
    [data?.pages]
  );
  const expandedRow = useMemo(
    () => (expandedId ? items.find((r) => r.id === expandedId) : null),
    [expandedId, items]
  );
  const { data: appLogsData, isLoading: appLogsLoading } = useAppLogsQuery(
    organizationId,
    currentEnvId,
    expandedRow?.tracingId ?? null
  );
  const appLogs = useMemo(
    () => (appLogsData?.items ?? []).slice().reverse(),
    [appLogsData?.items]
  );
  const total = data?.pages[0]?.total ?? 0;
  const hasMore = hasNextPage ?? false;
  const loadingMore = isFetchingNextPage;

  // Scroll to bottom when latest logs load (newest at bottom); skip when user clicked "Load more"
  useEffect(() => {
    if (items.length > 0 && shouldScrollToBottomRef.current && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      shouldScrollToBottomRef.current = false;
    }
  }, [items.length]);

  // When filters change, scroll to bottom on next data load
  useEffect(() => {
    shouldScrollToBottomRef.current = true;
  }, [appliedFilters]);

  if (projectsLoading || !project) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-6 flex-1 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6">
      <div className="flex shrink-0 flex-col gap-3">
        {/* Compact filters row */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <Select
            value={method || "all"}
            onValueChange={(v) => {
              const newMethod = v === "all" ? "" : v;
              setMethod(newMethod);
              setAppliedFilters((prev) => ({
                ...prev,
                method: newMethod.trim() || undefined,
              }));
            }}
          >
            <SelectTrigger size="sm" className="h-8 w-[100px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {METHOD_OPTIONS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="Status"
            value={statusCode}
            onChange={(e) => setStatusCode(e.target.value)}
            className="h-8 w-[72px] text-sm"
          />
          <Input
            placeholder="Route"
            value={routeSearch}
            onChange={(e) => setRouteSearch(e.target.value)}
            className="h-8 w-[120px] text-sm"
          />
          <Input
            placeholder="Trace ID"
            value={tracingId}
            onChange={(e) => setTracingId(e.target.value)}
            className="h-8 w-[100px] font-mono text-sm"
          />
          <Select
            value={timePeriod}
            onValueChange={(v) => {
              setTimePeriod(v);
              const { dateFrom, dateTo } = getDateRangeForPeriod(v);
              setAppliedFilters((prev) => ({
                ...prev,
                dateFrom,
                dateTo,
              }));
            }}
          >
            <SelectTrigger size="sm" className="h-8 w-[130px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" size="sm" disabled={isFetching} className="h-8">
            {isFetching ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={resetFilters}
            disabled={isFetching}
            className="h-8"
          >
            Reset
          </Button>
        </form>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
        {/* Results */}
        {/* <Card className="flex min-h-0 flex-1 flex-col relative">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Logs</CardTitle>
            {total >= 0 && (
              <span className="text-sm text-muted-foreground">
                {total} {total === 1 ? "log" : "logs"}
              </span>
            )}
          </CardHeader> */}
          <div className="min-h-0 flex-1 overflow-auto">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error.message}
              </p>
            )}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <ScrollText className="size-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No request logs yet. Send traffic with the Tracelet SDK to see logs here.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border bg-background shadow-lg">
                  <div className="flex items-center gap-2 border-b bg-background/80 px-4 py-2">
                    <Terminal className="size-4 text-zinc-500" />
                    <span className="text-xs font-medium text-zinc-400">
                      tracelet logs
                    </span>
                  </div>
                  <div
                    ref={logContainerRef}
                    className="max-h-[70vh] min-h-[200px] overflow-auto p-3 font-mono text-sm"
                  >
                    {[...items].reverse().map((row: RequestLogItem) => (
                      <div
                        key={row.id}
                        className="border-b last:border-0"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId((prev) => (prev === row.id ? null : row.id))
                          }
                          className="flex w-full flex-wrap items-baseline gap-x-2 gap-y-0.5 py-1.5 text-left leading-relaxed hover:bg-background/50"
                        >
                          <span className="shrink-0 text-zinc-500">
                            [{formatTerminalDateTime(row.timestamp)}]
                          </span>
                          <span className="shrink-0 font-semibold text-cyan-400">{row.method}</span>
                          <span className="min-w-0 truncate text-zinc-300" title={row.route}>
                            {row.route}
                          </span>
                          <span className={`shrink-0 font-semibold ${statusColor(row.statusCode)}`}>
                            {row.statusCode}
                          </span>
                          <span className="shrink-0 text-zinc-500">
                            {formatDuration(row.durationMs)}
                          </span>
                          <span className="shrink-0 text-zinc-600">
                            {formatBytes(row.responseSize)}
                          </span>
                          <span className="ml-1 shrink-0 text-zinc-600">
                            {expandedId === row.id ? "▼" : "▶"}
                          </span>
                        </button>
                        {expandedId === row.id && (
                          <div className="mb-2 ml-4 space-y-3">
                            <pre className="overflow-x-auto rounded border bg-background/80 p-3 text-xs text-zinc-300">
                              {JSON.stringify(
                                {
                                  id: row.id,
                                  requestId: row.requestId,
                                  tracingId: row.tracingId,
                                  method: row.method,
                                  route: row.route,
                                  statusCode: row.statusCode,
                                  durationMs: row.durationMs,
                                  responseSize: row.responseSize,
                                  timestamp: row.timestamp,
                                  createdAt: row.createdAt,
                                },
                                null,
                                2
                              )}
                            </pre>
                            <div className="rounded border bg-background/80 p-3">
                              <h4 className="mb-2 text-xs font-medium text-zinc-400">
                                Application logs
                                {appLogsData?.total != null && appLogsData.total > 0 && (
                                  <span className="ml-1.5 text-zinc-500">
                                    ({appLogsData.total})
                                  </span>
                                )}
                              </h4>
                              {appLogsLoading ? (
                                <div className="flex items-center gap-2 py-2 text-xs text-zinc-500">
                                  <Loader2 className="size-3.5 animate-spin" />
                                  Loading…
                                </div>
                              ) : appLogs.length === 0 ? (
                                <p className="py-2 text-xs text-zinc-500">
                                  No app logs for this request.
                                </p>
                              ) : (
                                <ul className="space-y-2 font-mono text-xs">
                                  {appLogs.map((log: AppLogItem) => (
                                    <AppLogRow key={log.id} log={log} />
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {hasMore && (
                  <div className="flex justify-center absolute bottom-0 left-0 right-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchNextPage()}
                      disabled={loadingMore}
                      className="bg-background/50 hover:bg-background"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Loading…
                        </>
                      ) : (
                        "Load more"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        {/* </Card> */}
      </div>
    </div>
  );
}
