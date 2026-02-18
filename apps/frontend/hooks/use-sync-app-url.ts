"use client";

import { useEffect } from "react";
import { notFound, usePathname, useParams, useRouter } from "next/navigation";

import {
  APP_BASE_PATH,
  APP_RESERVED_SEGMENTS,
  getAppProjectPath,
  getAppProjectSettingsPath,
} from "@/features/project/constants";
import { useProjectsQuery } from "@/features/project/queries";
import { useProjectStore } from "@/features/project/store";
import type { EnvId } from "@/features/project/store";
import { ENV_OPTIONS } from "@/features/project/store";
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
 * Syncs URL with project (org) and env store.
 * URL: /app/[projectSlug], /app/[projectSlug]/settings, /app/[projectSlug]/[environment].
 * One project = one organization. Three envs: development, staging, production.
 */
export function useSyncAppUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const projectSlug =
    typeof params.projectSlug === "string" ? params.projectSlug : null;
  const envSegmentFromPath =
    typeof params.environment === "string" ? params.environment : null;
  const envFromPath = getEnvFromPath(envSegmentFromPath);

  const projectsQuery = useProjectsQuery();
  const projectsFromStore = useProjectStore((s) => s.projects);
  const projects = projectsQuery.data ?? projectsFromStore;
  const setEnv = useProjectStore((s) => s.setEnv);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);

  useEffect(() => {
    const skipRoutes = [APP_ROUTES.getStarted.route];
    if (skipRoutes.includes(pathname as (typeof skipRoutes)[number])) return;

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
        if (!projectsQuery.isFetched) return;
        const hasValid = projects.some((p) => p.slug === firstSegment);
        if (!hasValid) return;
        return;
      }
    }

    if (!projectSlug) {
      router.replace(APP_ROUTES.projects.route);
      return;
    }

    const project = projects.find((p) => p.slug === projectSlug);
    if (!project) {
      if (!projectsQuery.isFetched) return;
      notFound();
      return;
    }

    setSelectedProjectId(project.id);

    // /app/[projectSlug]/settings
    if (pathname === getAppProjectSettingsPath(project.slug)) {
      setEnv(envFromPath);
      return;
    }

    if (
      envSegmentFromPath &&
      envSegmentFromPath !== "" &&
      !isValidEnv(envSegmentFromPath)
    ) {
      notFound();
      return;
    }

    // /app/[projectSlug] with no env → redirect to development
    if (!envSegmentFromPath || envSegmentFromPath === "") {
      setEnv(DEV_ENV);
      router.replace(getAppProjectPath(project.slug, DEV_ENV));
      return;
    }

    setEnv(envFromPath);
  }, [
    pathname,
    projectSlug,
    envSegmentFromPath,
    envFromPath,
    projects,
    setSelectedProjectId,
    setEnv,
    router,
    projectsQuery.isFetched,
  ]);
}
