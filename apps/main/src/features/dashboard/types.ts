export interface DashboardStatusCounts {
  success: number;
  clientError: number;
  serverError: number;
}

export interface DashboardStats {
  totalEvents?: number;
  totalHttpLogs: number;
  logsLast24h: number;
  errorRatePercent?: number;
  avgResponseTimeMs?: number | null;
  p95LatencyMs?: number | null;
  statusCounts: DashboardStatusCounts;
  eventsOverTime?: { hour: string; count: number }[];
  requestsOverTime: { hour: string; count: number }[];
  errorDistribution?: { label: string; count: number }[];
  slowestEndpoints?: { route: string; avgDurationMs: number; count: number }[];
  mostUsedEndpoints?: { route: string; count: number }[];
  recentLogs: {
    id: string;
    method: string | null;
    route: string | null;
    statusCode: number | null;
    durationMs: number | null;
    timestamp: string;
  }[];
  totalRoutes: number;
}
