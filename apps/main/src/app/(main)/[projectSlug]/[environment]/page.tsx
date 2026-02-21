"use client";

import { useParams } from "next/navigation";
import { useProjectsQuery } from "@/features/project";
import { useDashboardQuery, DashboardOverview } from "@/features/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ProjectEnvPage() {
  const params = useParams();
  const projectSlug = params.projectSlug as string;
  const env = (params.environment as string) ?? "development";

  const { data: projects, isLoading: projectsLoading } = useProjectsQuery();
  const project = projects?.find((p) => p.slug === projectSlug);
  const organizationId = project?.id;

  const { data: dashboardStats, isLoading: dashboardLoading, error: dashboardError } = useDashboardQuery(organizationId, env);

  if (projectsLoading || !project) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-6 grid flex-1 gap-4 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6">
      <div className="space-y-6">
        {dashboardLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : dashboardError ? (
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-destructive">{dashboardError.message}</p>
            </CardContent>
          </Card>
        ) : dashboardStats ? (
          <DashboardOverview stats={dashboardStats} projectSlug={projectSlug} env={env} organizationId={project.id} />
        ) : null}
      </div>
    </div>
  );
}
