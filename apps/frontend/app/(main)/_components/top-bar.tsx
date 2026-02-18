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
  useProjectStore,
  ENV_OPTIONS,
  getAppProjectPath,
  CreateProjectDialog,
} from "@/features/project";
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
  const projectSlug = useParams().projectSlug as string | undefined;
  const env = useProjectStore((s) => s.env);
  const setEnv = useProjectStore((s) => s.setEnv);
  const currentEnv = ENV_OPTIONS.find((e) => e.id === env) ?? ENV_OPTIONS[0];
  const pathname = usePathname();
  const projects = useProjectStore((s) => s.projects);
  const project = projects.find((p) => p.slug === projectSlug);
  function handleEnvChange(newEnvId: (typeof ENV_OPTIONS)[number]["id"]) {
    setEnv(newEnvId);
    if (projectSlug) {
      router.push(getAppProjectPath(projectSlug, newEnvId));
    }
  }

  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 h-full justify-between w-full">
        <h1 className="text-lg font-semibold">
          {getPageTitle(pathname, project?.name)}
        </h1>
        {projectSlug ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                decorations={false}
                className="gap-1.5 text-muted-foreground"
              >
                <Server className="size-3.5" />
                <span className="text-xs font-medium">{currentEnv.label}</span>
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
    </header>
  );
}
