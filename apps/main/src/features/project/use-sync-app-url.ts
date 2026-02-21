"use client";

import { useEffect } from "react";
import { notFound, usePathname, useParams, useRouter } from "next/navigation";
import {
  APP_RESERVED_SEGMENTS,
  getAppProjectPath,
  getAppProjectSettingsPath,
  ENV_OPTIONS,
  type EnvId,
} from "./constants";
import { useProjectsQuery } from "./queries";
import { APP_ROUTES } from "@/lib/constant";

function isValidEnv(value: string): value is EnvId {
  return ENV_OPTIONS.some((e) => e.id === value.toLowerCase());
}

function getEnvFromPath(envSegment: string | null): EnvId {
  if (envSegment && isValidEnv(envSegment)) return envSegment.toLowerCase() as EnvId;
  return "development";
}

export function useSyncAppUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const projectSlug = typeof params.projectSlug === "string" ? params.projectSlug : null;
  const envSegmentFromPath = typeof params.environment === "string" ? params.environment : null;
  const envFromPath = getEnvFromPath(envSegmentFromPath);

  const projectsQuery = useProjectsQuery();
  const projects = projectsQuery.data ?? [];

  useEffect(() => {
    if (pathname === APP_ROUTES.getStarted.route) return;

    const pathRest = pathname.replace(/^\//, "");
    const firstSegment = pathRest.split("/")[0];
    if (firstSegment && APP_RESERVED_SEGMENTS.includes(firstSegment as (typeof APP_RESERVED_SEGMENTS)[number])) {
      if (!projectsQuery.isFetched) return;
      const hasValid = projects.some((p) => p.slug === firstSegment);
      if (!hasValid) return;
      return;
    }

    const appBaseRoutes: string[] = [APP_ROUTES.base.route, APP_ROUTES.projects.route, APP_ROUTES.profile.route, APP_ROUTES.getStarted.route];
    if (!projectSlug) {
      if (appBaseRoutes.includes(pathname)) return;
      router.replace(APP_ROUTES.projects.route);
      return;
    }

    const project = projects.find((p) => p.slug === projectSlug);
    if (!project) {
      if (!projectsQuery.isFetched) return;
      notFound();
      return;
    }

    if (pathname === getAppProjectSettingsPath(project.slug)) return;

    if (envSegmentFromPath && envSegmentFromPath !== "" && !isValidEnv(envSegmentFromPath)) {
      notFound();
      return;
    }

    if (!envSegmentFromPath || envSegmentFromPath === "") {
      router.replace(getAppProjectPath(project.slug, "development"));
      return;
    }
  }, [pathname, projectSlug, envSegmentFromPath, envFromPath, projects, router, projectsQuery.isFetched]);
}
