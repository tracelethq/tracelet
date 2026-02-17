"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, Building2, LayoutGrid, Plus, Search } from "lucide-react";

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
import { getAppOrgProjectsPath } from "@/features/project/constants";
import { CreateOrgDialog } from "./create-org-dialog";
import { useOrganizationStore } from "../store";
import { useOrganizationsQuery } from "../queries";
import { APP_ROUTES } from "@/lib/constant";

export function OrgSwitcher({ collapsed }: { collapsed: boolean }) {
  const orgQuery = useOrganizationsQuery();
  const orgs = useOrganizationStore((s) => s.orgs);
  const selectedOrgId = useOrganizationStore((s) => s.selectedOrgId);
  const setSelectedOrgId = useOrganizationStore((s) => s.setSelectedOrgId);
  const [search, setSearch] = useState("");
  const loading = orgQuery.isLoading && orgs.length === 0;

  const selectedOrg = selectedOrgId
    ? (orgs.find((o) => o.id === selectedOrgId) ?? {
        id: "",
        name: "Select organization",
        slug: "",
      })
    : {
        id: "",
        name:
          orgs.length === 0 && !loading
            ? "No organization"
            : "Select organization",
        slug: "",
      };

  const getAllOrgsPath = () => {
    const orgSlug = selectedOrg?.slug||orgs[0]?.slug;
    if(!orgSlug) return `${APP_ROUTES.base}/get-started`;
    return `${APP_ROUTES.base}/${orgSlug}/projects`;
  };

  const filteredOrgs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [...orgs];
    return orgs.filter(
      (o) =>
        o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q),
    );
  }, [search, orgs]);

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
          aria-label="Change organization"
          disabled={loading}
        >
          <Building2 className="size-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">
                {loading ? "Loading…" : selectedOrg.name}
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
            placeholder="Search organizations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 border-0 bg-transparent px-2 py-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>
        <div className="max-h-48 overflow-y-auto py-1">
          {filteredOrgs.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              {orgs.length === 0
                ? "No organizations. Create one to get started."
                : "No matches"}
            </p>
          ) : (
            filteredOrgs.map((org) => (
              <DropdownMenuItem key={org.id} asChild>
                <Link
                  href={getAppOrgProjectsPath(org.slug)}
                  onClick={() => setSelectedOrgId(org.id)}
                >
                  {org.name}
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="mx-0" />
        <DropdownMenuItem asChild>
          <Link href={getAllOrgsPath()} className="gap-2">
            <LayoutGrid className="size-3.5" />
            View all Orgs
          </Link>
        </DropdownMenuItem>
        <CreateOrgDialog />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
