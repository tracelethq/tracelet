
/** Base path for app (main) routes. */
export const APP_BASE_PATH = "/app";

/** Path segments that are not org/project (reserved routes). */
export const APP_RESERVED_SEGMENTS = [
  "get-started",
  "not-found",
  "profile",
  "logs",
  "api-explorer",
  "projects",
  "dashboard",
] as const;

/** Second segment meaning "projects list" for an org: /app/[orgSlug]/projects */
export const PROJECTS_PAGE_SEGMENT = "projects" as const;

/**
 * Build app URL: /app/[orgSlug], /app/[orgSlug]/[projectSlug], or /app/[orgSlug]/[projectSlug]/[env].
 */
export function getAppOrgProjectPath(
  orgSlug: string,
  projectSlug?: string,
  env?: string
): string {
  const base = `${APP_BASE_PATH}/${orgSlug}`;
  if (projectSlug == null || projectSlug === "") return base;
  if (env) return `${base}/${projectSlug}/${env}`;
  return `${base}/${projectSlug}`;
}

/** URL for org-scoped projects list: /app/[orgSlug]/projects */
export function getAppOrgProjectsPath(orgSlug: string): string {
  return getAppOrgProjectPath(orgSlug, PROJECTS_PAGE_SEGMENT);
}

/** @deprecated Use getAppOrgProjectPath(orgSlug, projectSlug, env) for org-scoped paths. */
export function getAppProjectPath(projectSlug: string, env?: string): string {
  return getAppOrgProjectPath("", projectSlug, env);
}

/**
 * Parse org slug, project slug, and env from pathname.
 * Path: /app/[orgSlug] or /app/[orgSlug]/[projectSlug] or /app/[orgSlug]/[projectSlug]/[environment].
 * Reserved first segments (get-started, projects, etc.) return orgSlug: null.
 */
export function parseOrgProjectEnvFromPath(pathname: string): {
  orgSlug: string | null;
  projectSlug: string | null;
  env: string | null;
} {
  if (!pathname.startsWith(APP_BASE_PATH)) {
    return { orgSlug: null, projectSlug: null, env: null };
  }
  const rest = pathname.slice(APP_BASE_PATH.length).replace(/^\//, "");
  const segments = rest ? rest.split("/") : [];
  const first = segments[0] ?? null;
  const second = segments[1] ?? null;
  const third = segments[2] ?? null;

  if (!first) {
    return { orgSlug: null, projectSlug: null, env: null };
  }
  if (APP_RESERVED_SEGMENTS.includes(first as (typeof APP_RESERVED_SEGMENTS)[number])) {
    return { orgSlug: null, projectSlug: null, env: null };
  }
  return {
    orgSlug: first,
    projectSlug: second ?? null,
    env: third ?? null,
  };
}

/**
 * @deprecated Use parseOrgProjectEnvFromPath for org-scoped paths.
 */
export function parseProjectEnvFromPath(pathname: string): {
  projectSlug: string | null;
  env: string | null;
} {
  const { projectSlug, env } = parseOrgProjectEnvFromPath(pathname);
  return { projectSlug, env };
}
