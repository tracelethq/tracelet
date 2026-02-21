"use client";

import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/lib/auth-client";
import { useProjectsQuery } from "@/features/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { AlertTriangle } from "lucide-react";

export default function SettingsDangerZonePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectSlug = params.projectSlug as string;
  const { data: projects, isLoading } = useProjectsQuery();
  const project = projects?.find((p) => p.slug === projectSlug);
  const organizationId = project?.id;

  async function handleDelete() {
    if (!organizationId) return;
    const { error: err } = await authClient.organization.delete({
      organizationId,
    });
    if (err) throw new Error(err.message ?? "Failed to delete project");
    queryClient.removeQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    router.push("/projects");
  }

  if (isLoading || !project) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-6 flex-1 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Danger zone</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Irreversible actions. Delete this project and all its data.
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-6">
        <Card className="flex-1 border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Delete project
            </CardTitle>
            <CardDescription>
              Permanently delete <strong>{project.name}</strong> and all associated data (logs,
              API keys, environments). This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DeleteConfirmDialog
              title="Delete this project?"
              description={
                <>
                  Type <strong>{project.name}</strong> below to confirm. All data will be
                  permanently removed.
                </>
              }
              confirmLabel={project.name}
              placeholder={`Type "${project.name}" to confirm`}
              triggerLabel="Delete project"
              confirmButtonLabel="Delete permanently"
              onConfirm={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
