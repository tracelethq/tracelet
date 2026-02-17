"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PanelLeftClose,
  PanelLeft,
  LogsIcon,
  FolderOpenIcon,
  BuildingIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/features/auth";
import {
  CreateOrgDialog,
  OrgSwitcher,
  useOrganizationStore,
} from "@/features/organization";
import {
  getOrgPathName,
  getProjectPathName,
  PROJECT_MAIN_LINKS,
  PROJECT_SETTINGS_LINKS,
} from "@/features/project/constants";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const projectSlug = params.projectSlug as string;
  const env = (params.environment as string) ?? "development";

  const orgsFromStore = useOrganizationStore((s) => s.orgs);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[56px]" : "w-56",
      )}
    >
      <div
        className={cn(
          "flex h-12 shrink-0 items-center border-b border-sidebar-border px-2",
          collapsed && "justify-center",
        )}
      >
        <OrgSwitcher collapsed={collapsed} />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-auto p-2">
        {!projectSlug && (
          <>
            <div
              className={cn(
                "flex gap-0.5 items-center text-muted-foreground",
                collapsed && "justify-center",
              )}
            >
              <BuildingIcon className="size-4 shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">Organizations</span>
              )}
            </div>
            {orgsFromStore.map((org) => {
              const isActive = pathname.startsWith(
                getOrgPathName(org.slug, ""),
              );
              return (
                <Link
                  key={org.id}
                  href={getOrgPathName(org.slug, "/projects")}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors">
                    <span className="size-6 shrink-0 flex items-center justify-center bg-sidebar-accent text-sidebar-accent-foreground uppercase">
                      {org.name.charAt(0)}
                    </span>
                    {!collapsed && <span>{org.name}</span>}
                  </span>
                </Link>
              );
            })}
            <CreateOrgDialog className="mt-4" />
          </>
        )}
        {orgSlug && projectSlug && (
          <>
            <div
              className={cn(
                "flex gap-0.5 items-center text-muted-foreground",
                collapsed && "justify-center",
              )}
            >
              {!collapsed && (
                <span className="text-sm font-medium">Project</span>
              )}
            </div>
            {PROJECT_MAIN_LINKS.map(({ href, label, icon: Icon }) => {
              const link = getProjectPathName(orgSlug, projectSlug, env, href);
              const isActive = pathname === link;
              return (
                <Link key={href} href={link}>
                  <span
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    {!collapsed && <span>{label}</span>}
                  </span>
                </Link>
              );
            })}

            <div className="h-px bg-sidebar-border my-2" />

            <div
              className={cn(
                "flex gap-0.5 items-center text-muted-foreground",
                collapsed && "justify-center",
              )}
            >
              {!collapsed && (
                <span className="text-sm font-medium">Settings</span>
              )}
            </div>
            {PROJECT_SETTINGS_LINKS.map(({ id, name, icon: Icon, href, isHidden }) => {
              if (isHidden) return null;
              const link = getProjectPathName(orgSlug, projectSlug, env, href);
              const isActive = pathname === link;
              return (
                <Link key={href} href={link}>
                  <span
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    {!collapsed && <span>{name}</span>}
                  </span>
                </Link>
              );
            })}
          </>
        )}
      </nav>
      <div className="shrink-0 border-t border-sidebar-border p-2">
        <UserProfile collapsed={collapsed} />
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center border-t border-sidebar-border",
          collapsed ? "justify-center" : "",
        )}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          decorations={false}
          className={cn(
            "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "w-auto",
          )}
          divClassName={cn("w-full", collapsed && "w-auto")}
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
