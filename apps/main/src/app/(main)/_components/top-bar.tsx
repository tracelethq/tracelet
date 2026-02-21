"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { ChevronDown, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ENV_OPTIONS,
  getAppProjectPath,
} from "../../../features/project/constants";
import { useProjectsQuery } from "../../../features/project/queries";
import { CreateProjectDialog } from "../../../features/project/components/create-project-dialog";
import { APP_ROUTES } from "@/lib/constant";

function getPageTitle(pathname: string, projectName?: string): string {
  if (pathname === APP_ROUTES.base.route)
    return projectName ?? APP_ROUTES.base.label;
  if (pathname === APP_ROUTES.projects.route) return APP_ROUTES.projects.label;
  if (pathname === APP_ROUTES.profile.route) return APP_ROUTES.profile.label;
  if (pathname === APP_ROUTES.getStarted.route)
    return APP_ROUTES.getStarted.label;
  return projectName ?? APP_ROUTES.base.label;
}

export function TopBar({
  title,
  className,
}: {
  title?: string;
  className?: string;
}) {
  const router = useRouter();
  const params = useParams();
  const projectSlug = params.projectSlug as string | undefined;
  const envFromUrl = (params.environment as string) ?? "development";
  const env = ENV_OPTIONS.some((e) => e.id === envFromUrl)
    ? envFromUrl
    : ENV_OPTIONS[0].id;
  const currentEnv = ENV_OPTIONS.find((e) => e.id === env) ?? ENV_OPTIONS[0];
  const pathname = usePathname();
  const projectsQuery = useProjectsQuery();
  const projects = projectsQuery.data ?? [];
  const project = projects.find((p) => p.slug === projectSlug);

  function handleEnvChange(newEnvId: (typeof ENV_OPTIONS)[number]["id"]) {
    if (projectSlug) router.push(getAppProjectPath(projectSlug, newEnvId));
  }

  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4",
        className,
      )}
    >
      <div className="flex h-full w-full items-center justify-between">
        <h1 className="text-lg font-semibold">
          {getPageTitle(pathname, project?.name)}
        </h1>
        <div className="flex items-center gap-2">
          {projectSlug ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                >
                  <Server
                    className={cn("size-3.5 shrink-0", currentEnv.iconColor)}
                  />
                  <span className="text-xs font-medium">
                    {currentEnv.label}
                  </span>
                  <ChevronDown className="size-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {ENV_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => handleEnvChange(option.id)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <CreateProjectDialog />
          )}
        </div>
      </div>
    </header>
  );
}
