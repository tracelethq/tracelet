"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/features/auth";
import {
  ProjectSwitcher,
  getProjectPathName,
  getProjectSettingsPathName,
  PROJECT_MAIN_LINKS,
  PROJECT_SETTINGS_LINKS,
} from "@/features/project";
import { APP_ROUTES } from "@/lib/constant";
import { useSidebar } from "@/contexts/sidebar-context";

export function Sidebar() {
  const params = useParams();
  const pathname = usePathname();
  const projectSlug = params.projectSlug as string | undefined;
  const env = (params.environment as string) ?? "development";
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[56px]" : "w-56"
      )}
    >
      <div
        className={cn(
          "flex h-12 shrink-0 items-center border-b border-sidebar-border px-2",
          collapsed && "justify-center"
        )}
      >
        <ProjectSwitcher collapsed={collapsed} />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-auto p-2">
        {projectSlug ? (
          <>
            <div className={cn("flex items-center gap-0.5 text-muted-foreground", collapsed && "justify-center")}>
              {!collapsed && <span className="text-sm font-medium">Project</span>}
            </div>
            {PROJECT_MAIN_LINKS.map(({ href, label, icon: Icon }) => {
              const link = getProjectPathName(projectSlug, env, href);
              const isActive = pathname === link;
              return (
                <Link key={href} href={link}>
                  <span
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      collapsed && "justify-center"
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    {!collapsed && <span>{label}</span>}
                  </span>
                </Link>
              );
            })}
            <div className="my-2 h-px bg-sidebar-border" />
            <div className={cn("flex items-center gap-0.5 text-muted-foreground", collapsed && "justify-center")}>
              {!collapsed && <span className="text-sm font-medium">Settings</span>}
            </div>
            {PROJECT_SETTINGS_LINKS.filter((l) => !("isHidden" in l && l.isHidden)).map(
              ({ name, icon: Icon, href }) => {
                const link = getProjectPathName(projectSlug, env, href);
                const isActive = pathname === link;
                return (
                  <Link key={href} href={link}>
                    <span
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center"
                      )}
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      {!collapsed && <span>{name}</span>}
                    </span>
                  </Link>
                );
              }
            )}
            <div className="my-2 h-px bg-sidebar-border" />
          </>
        ) : (
          <Link href={APP_ROUTES.projects.route}>
            <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors">
              <Building2 className="size-4 shrink-0 text-muted-foreground" />
              {!collapsed && <span>Projects</span>}
            </span>
          </Link>
        )}
      </nav>
      <div className="shrink-0 border-t border-sidebar-border p-2">
        <UserProfile collapsed={collapsed} />
      </div>
      <div className={cn("shrink-0 border-t border-sidebar-border", collapsed ? "flex justify-center" : "")}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(
            "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "w-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="size-4" />
          ) : (
            <>
              <PanelLeftClose className="size-4" />
              <span className="ml-2">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
