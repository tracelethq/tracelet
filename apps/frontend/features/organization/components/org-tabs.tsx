"use client";

import { getOrgPathName } from "@/features/project/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ORG_TABS } from "../constants";

const OrgTabs = () => {
  const currentPath = usePathname();
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  const createProjectPath = getOrgPathName(orgSlug, "/projects");
  const createSettingsPath = getOrgPathName(orgSlug, "/settings");

  if (currentPath !== createProjectPath && currentPath !== createSettingsPath) {
    return <></>;
  }

  return (
    <div className="flex items-center gap-2 h-full">
      {ORG_TABS.map((tab) => {
        const isActive = currentPath === getOrgPathName(orgSlug, tab.href);
        return (
          <Link
            key={tab.href}
            href={getOrgPathName(orgSlug, tab.href)}
            className={cn(
              "flex items-center justify-center text-sm font-medium transition-colors h-full",
              isActive ? "text-primary border-b border-primary" : "text-muted-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};

export default OrgTabs;
