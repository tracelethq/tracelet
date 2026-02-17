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
  OrgSwitcher,
  useOrganizationsQuery,
  useOrganizationStore,
} from "@/features/organization";
import { APP_ROUTES } from "@/lib/constant";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/logs", label: "Logs", icon: LogsIcon },
  { href: "/api-explorer", label: "API Explorer", icon: FolderOpenIcon },
] as const;

const getProjectPathName = (
  orgSlug: string,
  projectSlug: string,
  path: string,
) => {
  if (path.startsWith("/")) {
    path = path.slice(1);
  }
  return `${APP_ROUTES.base}/${orgSlug}/${projectSlug}/${path}`;
};

const getOrgPathName = (orgSlug: string, path: string) => {
  if (path.startsWith("/")) {
    path = path.slice(1);
  }
  return `${APP_ROUTES.base}/${orgSlug}/${path}`;
};

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
              const isActive = pathname === getOrgPathName(org.slug, "/projects");
              return (
                <Link key={org.id} href={getOrgPathName(org.slug, "/projects")} className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-0",
                )}>
                  <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors">
                    <span className="size-6 shrink-0 flex items-center justify-center bg-sidebar-accent text-sidebar-accent-foreground uppercase">
                      {org.name.charAt(0)}
                    </span>
                    {!collapsed && <span>{org.name}</span>}
                  </span>
                </Link>
              );
            })}
          </>
        )}
        {orgSlug &&
          projectSlug &&
          navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === getProjectPathName(orgSlug, projectSlug, href);
            return (
              <Link
                key={href}
                href={getProjectPathName(orgSlug, projectSlug, href)}
              >
                <span
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </span>
              </Link>
            );
          })}
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
