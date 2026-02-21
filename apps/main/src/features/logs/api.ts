"use client";

import { authConfig } from "@/features/auth/config";

export type RequestLogItem = {
  id: string;
  requestId: string;
  tracingId: string;
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  responseSize: number;
  timestamp: string;
  createdAt: string;
};

export type LogsFilters = {
  method?: string;
  statusCode?: number;
  route?: string;
  tracingId?: string;
  dateFrom?: string; // ISO
  dateTo?: string;
  limit?: number;
  cursor?: string;
};

export type LogsResponse = {
  items: RequestLogItem[];
  nextCursor: string | null;
  total: number;
  hasMore: boolean;
};

export type AppLogItem = {
  id: string;
  tracingId: string;
  requestId: string | null;
  level: string;
  message: string | null;
  payload: unknown;
  timestamp: string;
  createdAt: string;
};

export type AppLogsResponse = {
  items: AppLogItem[];
  nextCursor: string | null;
  total: number;
  hasMore: boolean;
};

const API_BASE = `${authConfig.baseURL}/api`;

export async function fetchLogs(
  organizationId: string,
  env: string,
  filters: LogsFilters = {}
): Promise<LogsResponse> {
  const params = new URLSearchParams();
  params.set("env", env);
  if (filters.method) params.set("method", filters.method);
  if (filters.statusCode !== undefined) params.set("statusCode", String(filters.statusCode));
  if (filters.route) params.set("route", filters.route);
  if (filters.tracingId) params.set("tracingId", filters.tracingId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.cursor) params.set("cursor", filters.cursor);

  const res = await fetch(
    `${API_BASE}/organizations/${encodeURIComponent(organizationId)}/logs?${params}`,
    { credentials: "include" }
  );
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    if (res.status === 404) throw new Error("Project not found");
    throw new Error("Failed to fetch logs");
  }
  return res.json();
}

export async function fetchAppLogs(
  organizationId: string,
  env: string,
  options: { tracingId?: string; limit?: number; cursor?: string } = {}
): Promise<AppLogsResponse> {
  const params = new URLSearchParams();
  params.set("env", env);
  if (options.tracingId) params.set("tracingId", options.tracingId);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.cursor) params.set("cursor", options.cursor);

  const res = await fetch(
    `${API_BASE}/organizations/${encodeURIComponent(organizationId)}/logs/app-logs?${params}`,
    { credentials: "include" }
  );
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    if (res.status === 404) throw new Error("Project not found");
    throw new Error("Failed to fetch app logs");
  }
  return res.json();
}
