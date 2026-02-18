"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/lib/auth-client";
import {
  getAppProjectPath,
  getAppProjectSettingsPath,
} from "@/features/project/constants";
import { UpdateProjectForm } from "@/features/project/components/update-project-form";
import { useProjectStore } from "@/features/project/store";
import { useProjectsQuery } from "@/features/project/queries";
import { APP_ROUTES } from "@/lib/constant";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectSlug = typeof params.projectSlug === "string" ? params.projectSlug : "";

  const projectsQuery = useProjectsQuery();
  const projects = useProjectStore((s) => s.projects);
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);
  const setProjects = useProjectStore((s) => s.setProjects);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const project = projectSlug
    ? projects.find((p) => p.slug === projectSlug)
    : selectedProjectId
      ? projects.find((p) => p.id === selectedProjectId)
      : null;

  const handleSubmit = async (values: { name: string; slug: string }) => {
    if (!project) return;
    const result = await authClient.organization.update({
      data: { name: values.name, slug: values.slug },
      organizationId: project.id,
    });
    if (result.error) throw new Error(result.error.message ?? "Failed to update project");
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
    await queryClient.refetchQueries({ queryKey: ["projects"] });
    setSelectedProjectId(project.id);
    if (result.data.slug !== projectSlug) {
      router.push(getAppProjectSettingsPath(result.data.slug));
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
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
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to delete project.";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
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
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="text-muted-foreground mt-1 text-sm mb-6">
        Update your project details.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Project</CardTitle>
          <CardDescription>
            Change the display name and URL slug. Updating the slug will change the project URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateProjectForm
            defaultValues={{ name: project.name, slug: project.slug }}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      <Card className="mt-6 border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete this project and all its data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog
            onOpenChange={(open) => {
              if (!open) {
                setDeleteError(null);
                setDeleteConfirmName("");
              }
            }}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive" type="button">
                Delete project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{project.name}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the project and all its data. This action cannot be undone. Type the project name below to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={project.name}
                disabled={isDeleting}
                className="mt-2"
                autoComplete="off"
              />
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  disabled={isDeleting || deleteConfirmName.trim() !== project.name}
                  onClick={handleDelete}
                >
                  {isDeleting ? "Deleting…" : "Delete project"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
