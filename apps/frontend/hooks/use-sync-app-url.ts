"use client";

import { useEffect } from "react";
import { notFound, usePathname, useParams, useRouter } from "next/navigation";

import {
  APP_BASE_PATH,
  APP_RESERVED_SEGMENTS,
  getAppOrgProjectPath,
  getAppOrgProjectsPath,
  PROJECTS_PAGE_SEGMENT,
} from "@/features/project/constants";
import { useProjectsQuery } from "@/features/project/queries";
import { useProjectStore } from "@/features/project/store";
import type { EnvId } from "@/features/project/store";
import { ENV_OPTIONS } from "@/features/project/store";
import { useOrganizationStore, useOrganizationsQuery } from "@/features/organization";
import { APP_ROUTES } from "@/lib/constant";

const DEV_ENV: EnvId = "development";

function isValidEnv(value: string): value is EnvId {
  return ENV_OPTIONS.some((e) => e.id === value.toLowerCase());
}

function getEnvFromPath(envSegment: string | null): EnvId {
  if (envSegment && isValidEnv(envSegment)) {
    return envSegment.toLowerCase() as EnvId;
  }
  return "development";
}

/**
 * Syncs URL path with org, project, and env store.
 * URL structure: /app/[orgSlug], /app/[orgSlug]/projects, /app/[orgSlug]/[projectSlug]/[environment].
 * - Reserved first segment (get-started, projects, etc.) → require valid org or redirect to get-started.
 * - No org in path or org not in list → redirect to get-started or notFound.
 * - Org in path → set org, fetch projects, then sync project + env from path.
 */
export function useSyncAppUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const orgSlug = typeof params.orgSlug === "string" ? params.orgSlug : null;
  const projectSlug = typeof params.projectSlug === "string" ? params.projectSlug : null;
  const envSegmentFromPath =
    typeof params.environment === "string" ? params.environment : null;
  const envFromPath = getEnvFromPath(envSegmentFromPath);

  const orgQuery = useOrganizationsQuery();
  const orgsFromStore = useOrganizationStore((s) => s.orgs);
  const orgs = orgQuery.data ?? orgsFromStore;
  const selectedOrgId = useOrganizationStore((s) => s.selectedOrgId);
  const setSelectedOrgId = useOrganizationStore((s) => s.setSelectedOrgId);

  const projects = useProjectStore((s) => s.projects);
  const setEnv = useProjectStore((s) => s.setEnv);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);
  useProjectsQuery(selectedOrgId);

  useEffect(() => {
    const nonCheckRoutes: string[] = [APP_ROUTES.getStarted];
    if (nonCheckRoutes.includes(pathname)) return;
    
    if (pathname.startsWith(APP_BASE_PATH)) {
      const firstSegment = pathname
      .slice(APP_BASE_PATH.length)
      .replace(/^\//, "")
      .split("/")[0];
      if (
        firstSegment &&
        APP_RESERVED_SEGMENTS.includes(
          firstSegment as (typeof APP_RESERVED_SEGMENTS)[number],
        )
      ) {
        // On a reserved route (e.g. /app/projects): need an org selected or redirect to get-started
        if (!orgQuery.isFetched) return;
        if (orgs.length === 0) {
          router.replace(APP_ROUTES.getStarted);
          return;
        }
        const hasValidOrg = selectedOrgId && orgs.some((o) => o.id === selectedOrgId);
        if (!hasValidOrg) {
          router.replace(APP_ROUTES.getStarted);
          return;
        }
        return;
      }
    }
    
    if (!orgSlug) {
      router.replace(APP_ROUTES.getStarted);
      return;
    }
    
    const org = orgs.find((o) => o.slug === orgSlug);
    if (!org) {
      if (!orgQuery.isFetched) return; // still loading orgs
      notFound();
      return;
    }
    
    setSelectedOrgId(org.id);
    
    if(projectSlug==="projects") return;
    if (
      envSegmentFromPath &&
      envSegmentFromPath !== "" &&
      !isValidEnv(envSegmentFromPath)
    ) {
      notFound();
    }

    // Org selected but no project in URL → go to projects page
    if (!projectSlug || projectSlug === "") {
      setSelectedProjectId("");
      setEnv(DEV_ENV);
      router.replace(getAppOrgProjectsPath(org.slug));
      return;
    }

    // On projects list page: /app/[orgSlug]/projects
    if (projectSlug === PROJECTS_PAGE_SEGMENT) {
      setSelectedProjectId("");
      setEnv(DEV_ENV);
      return;
    }

    const project = projects.find((p) => p.slug === projectSlug);
    if (!project) {
      if (projects.length === 0) return; // still loading projects for this org
      setSelectedProjectId("");
      setEnv(envFromPath);
      notFound();
      return;
    }

    setSelectedProjectId(project.id);
    setEnv(envFromPath);

    // Project selected but no env in URL → go to dev env
    if (envSegmentFromPath == null || envSegmentFromPath === "") {
      router.replace(getAppOrgProjectPath(org.slug, project.slug, DEV_ENV));
    }
  }, [
    pathname,
    orgSlug,
    projectSlug,
    envSegmentFromPath,
    envFromPath,
    orgs,
    projects,
    selectedOrgId,
    setSelectedOrgId,
    setEnv,
    setSelectedProjectId,
    router,
    orgQuery.isFetched,
  ]);
}
