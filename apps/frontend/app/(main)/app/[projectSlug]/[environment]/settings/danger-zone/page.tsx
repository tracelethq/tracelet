"use client";

import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/lib/auth-client";
import { getAppProjectPath } from "@/features/project/constants";
import { useProjectStore } from "@/features/project/store";
import { useProjectsQuery } from "@/features/project/queries";
import { APP_ROUTES } from "@/lib/constant";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DangerZoneSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectSlug = typeof params.projectSlug === "string" ? params.projectSlug : "";

  const projectsQuery = useProjectsQuery();
  const projects = useProjectStore((s) => s.projects);
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
  const setProjects = useProjectStore((s) => s.setProjects);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);

  const project = projectSlug
    ? projects.find((p) => p.slug === projectSlug)
    : selectedProjectId
      ? projects.find((p) => p.id === selectedProjectId)
      : null;

  const handleDeleteProject = async () => {
    if (!project) return;
    const result = await authClient.organization.delete({
      organizationId: project.id,
    });
    if (result.error) throw new Error(result.error.message ?? "Failed to delete project");
    const remaining = projects.filter((p) => p.id !== project.id);
    setProjects(remaining);
    setSelectedProjectId(remaining[0]?.id ?? "");
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
    await queryClient.refetchQueries({ queryKey: ["projects"] });
    router.push(
      remaining.length > 0
        ? getAppProjectPath(remaining[0].slug, "development")
        : APP_ROUTES.getStarted.route
    );
  };

  if (!projectsQuery.isFetched && projects.length === 0) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground text-sm">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Danger zone</h1>
      <p className="text-muted-foreground mt-1 text-sm mb-6">
        Irreversible and destructive actions. Proceed with caution.
      </p>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Delete project</CardTitle>
          <CardDescription>
            Permanently delete this project and all its data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteConfirmDialog
            title={`Delete "${project.name}"?`}
            description="This will permanently delete the project and all its data. This action cannot be undone. Type the project name below to confirm."
            confirmLabel={project.name}
            triggerLabel="Delete project"
            onConfirm={handleDeleteProject}
          />
        </CardContent>
      </Card>
    </div>
  );
}
