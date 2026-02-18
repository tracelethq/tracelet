"use client";

import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/lib/auth-client";
import { getAppProjectSettingsPath } from "@/features/project/constants";
import { UpdateProjectForm } from "@/features/project/components/update-project-form";
import { useProjectStore } from "@/features/project/store";
import { useProjectsQuery } from "@/features/project/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function GeneralSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectSlug = typeof params.projectSlug === "string" ? params.projectSlug : "";

  const projectsQuery = useProjectsQuery();
  const projects = useProjectStore((s) => s.projects);
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);

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
    </div>
  );
}
