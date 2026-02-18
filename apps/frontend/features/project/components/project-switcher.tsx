"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, Folder, Plus, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAppProjectPath } from "../constants";
import { useProjectsQuery } from "../queries";
import { useProjectStore } from "../store";
import { CreateProjectDialog } from "./create-project-dialog";
import Link from "next/link";
import { APP_ROUTES } from "@/lib/constant";

export function ProjectSwitcher({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const projectSlug = useParams().projectSlug as string | undefined;
  const env = useProjectStore((s) => s.env);
  const projectsQuery = useProjectsQuery();
  const projects = useProjectStore((s) => s.projects);
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);
  const [search, setSearch] = useState("");

  const selectedProject = selectedProjectId
    ? (projects.find((p) => p.id === selectedProjectId) ?? {
        id: "",
        name: "Select project",
        slug: "",
      })
    : { id: "", name: "Select project", slug: "" };

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [...projects];
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [search, projects]);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setSearch("");
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className={cn(
            "w-full min-w-0 justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring",
            collapsed && "justify-center px-2",
          )}
          divClassName="w-full"
          aria-label="Change project"
        >
          <Folder className="size-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">
                {selectedProject.name}
              </span>
              <ChevronDown className="size-4 shrink-0 opacity-70" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side={collapsed ? "right" : "bottom"}
        className="w-56 p-0"
      >
        <div className="flex items-center border-b border-border px-2 py-1.5">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 border-0 bg-transparent px-2 py-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>
        <div className="max-h-48 overflow-y-auto py-1">
          {projectsQuery.isLoading && projects.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              Loading…
            </p>
          ) : filteredProjects.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              No projects found
            </p>
          ) : (
            filteredProjects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  router.push(getAppProjectPath(project.slug, env));
                }}
              >
                {project.name}
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="bg-muted">
          <DropdownMenuItem asChild>
            <Link href={APP_ROUTES.projects.route}>
              <span className="text-sm font-medium">All project</span>
            </Link>
          </DropdownMenuItem>
          <CreateProjectDialog isIn={true} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
