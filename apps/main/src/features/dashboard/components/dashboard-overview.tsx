"use client";

import { StatCards } from "./stat-cards";
import { RequestsChart } from "./requests-chart";
import { ErrorDistributionChart } from "./error-distribution-chart";
import { SlowestEndpointsChart } from "./slowest-endpoints-chart";
import { MostUsedEndpointsChart } from "./most-used-endpoints-chart";
import { RecentActivity } from "./recent-activity";
import { useDashboardRefresh } from "../queries";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { DashboardStats } from "../types";

interface DashboardOverviewProps {
  stats: DashboardStats;
  projectSlug: string;
  env: string;
  organizationId: string;
}

export function DashboardOverview({ stats, projectSlug, env, organizationId }: DashboardOverviewProps) {
  const refresh = useDashboardRefresh(organizationId, env);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending}
        >
          <RefreshCw className={`size-4 shrink-0 ${refresh.isPending ? "animate-spin" : ""}`} />
          {refresh.isPending ? "Refreshing…" : "Refresh stats"}
        </Button>
      </div>
      <StatCards stats={stats} />
      <RequestsChart stats={stats} />
      <ErrorDistributionChart stats={stats} />
      <div className="grid gap-4 md:grid-cols-2">
        <SlowestEndpointsChart stats={stats} />
        <MostUsedEndpointsChart stats={stats} />
      </div>
      <RecentActivity stats={stats} projectSlug={projectSlug} env={env} />
    </div>
  );
}
