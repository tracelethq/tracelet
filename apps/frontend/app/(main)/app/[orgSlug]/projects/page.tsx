"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Folder, Plus } from "lucide-react";

import { getAppOrgProjectPath } from "@/features/project/constants";
import { useProjectsQuery } from "@/features/project/queries";
import { useProjectStore } from "@/features/project/store";
import { CreateProjectDialog } from "@/features/project/components/create-project-dialog";
import { useOrganizationStore } from "@/features/organization";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Decorations from "@/components/ui/decorations";

/**
 * Projects list for an org: /app/[orgSlug]/projects.
 * Org is selected; no project selected. Sync hook keeps URL and store in sync.
 */
export default function OrgProjectsPage() {
  const params = useParams();
  const orgSlug = typeof params.orgSlug === "string" ? params.orgSlug : "";
  const selectedOrgId = useOrganizationStore((s) => s.selectedOrgId);
  const projectsQuery = useProjectsQuery(selectedOrgId);
  const projectsFromStore = useProjectStore((s) => s.projects);
  const projects = projectsQuery.data ?? projectsFromStore;

  const isLoading = projectsQuery.isLoading && projects.length === 0;

  return (
    <div className="p-6">
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading projects…</p>
      ) : projects.length === 0 ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Folder className="size-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">No projects</p>
            <p className="text-muted-foreground text-sm max-w-sm">
              Create a project to start tracking environments and config.
            </p>
          </div>
          <CreateProjectDialog className="w-auto" 
              divClassName="w-auto"/>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={getAppOrgProjectPath(
                  orgSlug,
                  project.slug,
                  "development",
                )}
                className="block group"
              >
                <Card className="transition-colors group-hover:bg-primary/10 relative overflow-visible">
                  <Decorations
                    variant="active"
                    className="absolute inset-0 z-0"
                  />
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted group-hover:bg-primary/60">
                      <Folder className="size-5 text-muted-foreground group-hover:text-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-sm">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="truncate text-xs">
                        {project.slug}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
