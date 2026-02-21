"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchLogs, fetchAppLogs, type LogsFilters } from "./api";

export function useLogsQuery(
  organizationId: string | undefined,
  env: string,
  filters: LogsFilters
) {
  return useQuery({
    queryKey: ["logs", organizationId, env, filters],
    queryFn: () =>
      organizationId ? fetchLogs(organizationId, env, filters) : Promise.reject(new Error("No org")),
    enabled: !!organizationId,
  });
}

/** Use for paginated logs with "Load more". Filters should not include cursor. */
export function useLogsInfiniteQuery(
  organizationId: string | undefined,
  env: string,
  filters: Omit<LogsFilters, "cursor">
) {
  return useInfiniteQuery({
    queryKey: ["logs-infinite", organizationId, env, filters],
    queryFn: ({ pageParam }) =>
      organizationId
        ? fetchLogs(organizationId, env, { ...filters, cursor: pageParam })
        : Promise.reject(new Error("No org")),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!organizationId,
  });
}

/** Fetch app logs for a given tracingId (e.g. when expanding an HTTP log row). */
export function useAppLogsQuery(
  organizationId: string | undefined,
  env: string,
  tracingId: string | null
) {
  return useQuery({
    queryKey: ["app-logs", organizationId, env, tracingId],
    queryFn: () =>
      organizationId && tracingId
        ? fetchAppLogs(organizationId, env, { tracingId, limit: 100 })
        : Promise.resolve({ items: [], nextCursor: null, total: 0, hasMore: false }),
    enabled: !!organizationId && !!tracingId,
  });
}
