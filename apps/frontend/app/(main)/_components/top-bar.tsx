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
  getAppProjectPath,
  useProjectStore,
  ENV_OPTIONS,
  ProjectSwitcher,
} from "@/features/project";

function getPageTitle(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).pop();
  if (!segment) return "Dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function TopBar({
  title,
  className,
}: {
  title?: string;
  className?: string;
}) {
  const router = useRouter();
  const { orgSlug,projectSlug } = useParams();
  const pathname = usePathname();
  const displayTitle = title ?? getPageTitle(pathname);
  const env = useProjectStore((s) => s.env);
  const setEnv = useProjectStore((s) => s.setEnv);
  const projects = useProjectStore((s) => s.projects);
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
  const currentEnv = ENV_OPTIONS.find((e) => e.id === env) ?? ENV_OPTIONS[0];
  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : null;

  function handleEnvChange(newEnvId: (typeof ENV_OPTIONS)[number]["id"]) {
    setEnv(newEnvId);
    if (selectedProject) {
      router.push(getAppProjectPath(selectedProject.slug, newEnvId));
    }
  }

  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4",
        className,
      )}
    >
      <h1 className="truncate text-sm font-semibold text-foreground">
        {displayTitle}
      </h1>
      <div className="flex items-center gap-2">
        {projectSlug && (
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
        )}
        {projectSlug && <ProjectSwitcher collapsed={false} />}
      </div>
    </header>
  );
}
