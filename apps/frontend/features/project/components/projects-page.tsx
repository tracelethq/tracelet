"use client";

import Link from "next/link";
import {
  FolderPlus,
  BarChart2,
  MoreVertical,
  Settings,
  GitBranch,
  LayoutDashboard,
  Layers,
} from "lucide-react";

import {
  getAppProjectPath,
  getAppProjectSettingsPath,
} from "@/features/project/constants";
import { useProjectsQuery } from "@/features/project/queries";
import { useProjectStore } from "@/features/project/store";
import { CreateProjectDialog } from "@/features/project/components/create-project-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProjectsPageComponent() {
  const projectsQuery = useProjectsQuery();
  const projectsFromStore = useProjectStore((s) => s.projects);
  const projects = projectsQuery.data ?? projectsFromStore;

  const isLoading = projectsQuery.isLoading && projects.length === 0;
  const isEmpty = !isLoading && projects.length === 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-muted-foreground text-sm mt-0.5">
            Open a project or create a new one.
          </p>
        </div>
      </div>

      {isLoading && (
        <p className="text-muted-foreground text-sm">Loading projects…</p>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <FolderPlus className="size-12 text-muted-foreground" />
          <p className="text-muted-foreground">No projects yet</p>
          <p className="text-muted-foreground text-sm max-w-sm">
            Create a project to get started. Each project has development,
            staging, and production environments.
          </p>
          <CreateProjectDialog />
        </div>
      )}

      {!isEmpty && !isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-muted/30"
            >
              <CardContent className="p-4">
                {/* Top: icon + name/url + action buttons */}
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={getAppProjectPath(project.slug, "development")}
                    className="min-w-0 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <span className="font-semibold text-lg">
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="font-semibold text-base truncate">
                          {project.name}
                        </p>
                        <p className="text-muted-foreground text-sm truncate">
                          {project.slug}.app
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      decorations={false}
                      className="size-8 rounded-full border-muted-foreground/30"
                      asChild
                    >
                      <Link
                        href={getAppProjectPath(project.slug, "logs")}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Open overview"
                      >
                        <BarChart2 className="size-4" />
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          decorations={false}
                          className="size-8 rounded-full border-muted-foreground/30"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="More options"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={getAppProjectPath(project.slug, "development")}
                            className="flex items-center gap-2"
                          >
                            <LayoutDashboard className="size-4" />
                            Overview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={getAppProjectSettingsPath(project.slug)}
                            className="flex items-center gap-2"
                          >
                            <Settings className="size-4" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Middle: environments pill */}
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1.5 text-xs text-muted-foreground">
                    <Layers className="size-3.5 shrink-0" />
                    Development · Staging · Production
                  </span>
                </div>

                {/* Bottom: open CTA + env label */}
                <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                  <Link
                    href={getAppProjectPath(project.slug, "development")}
                    className="text-foreground font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                  >
                    Open in Development
                  </Link>
                  <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                    <GitBranch className="size-3" />
                    development
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
