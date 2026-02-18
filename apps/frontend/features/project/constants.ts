import {
  BanIcon,
  BuildingIcon,
  FolderOpenIcon,
  KeyIcon,
  LayoutDashboard,
  LogsIcon, UsersIcon, WebhookIcon
} from "lucide-react";

/** Base path for app (main) routes. */
export const APP_BASE_PATH = "/app";

export const PROJECT_MAIN_LINKS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/logs", label: "Logs", icon: LogsIcon },
  { href: "/api-explorer", label: "API Explorer", icon: FolderOpenIcon },
];

export const PROJECT_SETTINGS_LINKS = [
  {
    id: "general",
    name: "General",
    icon: BuildingIcon,
    href: "/settings/general",
  },
  {
    id: "api-keys",
    name: "API Keys",
    icon: KeyIcon,
    href: "/settings/api-keys",
  },
  {
    id: "members",
    name: "Members",
    icon: UsersIcon,
    href: "/settings/members",
    isHidden: true,
    isDisabled: false,
  },
  {
    id: "webhooks",
    name: "Webhooks",
    icon: WebhookIcon,
    href: "/settings/webhooks",
    isHidden: true,
    isDisabled: false,
  },
  {
    id: "danger-zone",
    name: "Danger Zone",
    icon: BanIcon,
    href: "/settings/danger-zone",
  },
];

/** First path segments that are not a project slug (reserved). */
export const APP_RESERVED_SEGMENTS = [
  "get-started",
  "not-found",
  "profile",
  "projects",
] as const;

/**
 * Build app URL: /app/[projectSlug] or /app/[projectSlug]/[env].
 * Project = organization (one org per project).
 */
export function getAppProjectPath(projectSlug: string, env?: string): string {
  const base = `${APP_BASE_PATH}/${projectSlug}`;
  if (env) return `${base}/${env}`;
  return base;
}

/** Path for project settings: /app/[projectSlug]/settings */
export function getAppProjectSettingsPath(projectSlug: string): string {
  return `${APP_BASE_PATH}/${projectSlug}/settings`;
}

/** Build path for a link under a project + env: e.g. /app/foo/development/logs */
export function getProjectPathName(
  projectSlug: string,
  env: string,
  path: string
): string {
  const p = path.startsWith("/") ? path.slice(1) : path;
  if (!p) return getAppProjectPath(projectSlug, env);
  return `${getAppProjectPath(projectSlug, env)}/${p}`;
}

/** Build path for a link under project (e.g. settings): /app/foo/settings */
export function getProjectSettingsPathName(projectSlug: string, path: string): string {
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${APP_BASE_PATH}/${projectSlug}/${p}`;
}

/**
 * Parse project slug and env from pathname.
 * Path: /app/[projectSlug] or /app/[projectSlug]/[env] or /app/[projectSlug]/settings...
 */
export function parseProjectEnvFromPath(pathname: string): {
  projectSlug: string | null;
  env: string | null;
  isSettings: boolean;
} {
  if (!pathname.startsWith(APP_BASE_PATH)) {
    return { projectSlug: null, env: null, isSettings: false };
  }
  const rest = pathname.slice(APP_BASE_PATH.length).replace(/^\//, "");
  const segments = rest ? rest.split("/") : [];
  const first = segments[0] ?? null;
  const second = segments[1] ?? null;

  if (!first) return { projectSlug: null, env: null, isSettings: false };
  if (
    APP_RESERVED_SEGMENTS.includes(
      first as (typeof APP_RESERVED_SEGMENTS)[number]
    )
  ) {
    return { projectSlug: null, env: null, isSettings: false };
  }
  const isSettings = second === "settings";
  const envValues = ["development", "staging", "production"];
  const env =
    second && envValues.includes(second.toLowerCase()) ? second.toLowerCase() : null;
  return {
    projectSlug: first,
    env: env,
    isSettings,
  };
}
