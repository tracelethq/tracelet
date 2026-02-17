"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, Folder, LayoutGrid, Plus, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAppOrgProjectPath } from "../constants";
import { useProjectStore } from "../store";
import { useOrganizationStore } from "@/features/organization";
import { APP_ROUTES } from "@/lib/constant";

export function ProjectSwitcher({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const { orgSlug } = useParams();
  const orgs = useOrganizationStore((s) => s.orgs);
  const selectedOrgId = useOrganizationStore((s) => s.selectedOrgId);
  const projects = useProjectStore((s) => s.projects);
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);
  const env = useProjectStore((s) => s.env);
  const [search, setSearch] = useState("");
  const org = selectedOrgId ? orgs.find((o) => o.id === selectedOrgId) : null;
  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId) ?? {
        id: "",
        name: "Select project",
        slug: "",
      }
    : {
        id: "",
        name: "Select project",
        slug: "",
      };

    const createProjectPath = `/app/${orgSlug}/projects`;

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
          divClassName={"w-full"}
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
          {filteredProjects.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              No projects found
            </p>
          ) : (
            filteredProjects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  if (org) router.push(getAppOrgProjectPath(org.slug, project.slug, env));
                }}
              >
                {project.name}
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="mx-0" />
        <DropdownMenuItem asChild>
          <Link href={createProjectPath} className="gap-2">
            <LayoutGrid className="size-3.5" />
            View all projects
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 bg-muted"
          onSelect={(e) => e.preventDefault()}
          onClick={() => {
            // TODO: open popover or navigate to create project page
          }}
        >
          <Plus className="size-3.5" />
          Create project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
