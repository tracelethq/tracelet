"use client";

import Link from "next/link";
import { useProjectsQuery } from "@/features/project";
import { getAppProjectPath, ENV_OPTIONS } from "@/features/project/constants";
import { CreateProjectDialog } from "@/features/project";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Folder, BarChart3, MoreHorizontal, GitBranch, Users } from "lucide-react";

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1d ago";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString();
  } catch {
    return "";
  }
}

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjectsQuery();

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {!projects?.length ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <h2 className="text-lg font-semibold">No projects yet</h2>
            <p className="text-muted-foreground text-sm">
              Create a project to start tracking logs and exploring your API.
            </p>
          </CardHeader>
          <CardContent>
            <CreateProjectDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border transition-colors hover:bg-muted/50"
            >
              <CardHeader className="flex flex-row items-start gap-3 pb-3">
                <Link
                  href={getAppProjectPath(project.slug, "development")}
                  className="flex min-w-0 flex-1 items-start gap-3"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Folder className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-foreground">{project.name}</h3>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                      {project.slug}
                    </p>
                  </div>
                </Link>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                    aria-label="View logs"
                    asChild
                  >
                    <Link href={getAppProjectPath(project.slug, "development") + "/logs"}>
                      <BarChart3 className="size-4" />
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={getAppProjectPath(project.slug, "development")}>
                          View project
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={getAppProjectPath(project.slug, "development") + "/settings/general"}>
                          Settings
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <div className="flex flex-1 flex-col">
                <CardContent className="flex flex-1 flex-col gap-3 pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {ENV_OPTIONS.map((env) => (
                      <Link
                        key={env.id}
                        href={getAppProjectPath(project.slug, env.id)}
                        className="inline-flex items-center rounded-md border border-border bg-muted/60 px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <span className={`mr-1.5 size-1.5 rounded-full ${env.color}`} />
                        {env.label}
                      </Link>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                    {project.createdAt && (
                      <span>{formatRelativeTime(project.createdAt)}</span>
                    )}
                    {project.createdAt && (
                      <span>on</span>
                    )}
                    <span className="flex items-center gap-1">
                      <GitBranch className="size-3.5" />
                      development
                    </span>
                    {typeof project.memberCount === "number" && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5" />
                          {project.memberCount} {project.memberCount === 1 ? "member" : "members"}
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
