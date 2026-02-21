import {
  Ban,
  Building2,
  FolderOpen,
  Key,
  LayoutDashboard,
  ScrollText,
  Users,
  Link2,
} from "lucide-react";

export const APP_BASE_PATH = "";

export const ENV_OPTIONS = [
  { id: "development", label: "Development", color: "bg-green-500", iconColor: "text-green-500" },
  { id: "staging", label: "Staging", color: "bg-yellow-500", iconColor: "text-amber-500" },
  { id: "production", label: "Production", color: "bg-red-500", iconColor: "text-red-500" },
] as const;

export type EnvId = (typeof ENV_OPTIONS)[number]["id"];

export const PROJECT_MAIN_LINKS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/logs", label: "Logs", icon: ScrollText },
  { href: "/api-explorer", label: "API Explorer", icon: FolderOpen },
];

export const PROJECT_SETTINGS_LINKS = [
  { id: "general", name: "General", icon: Building2, href: "/settings/general" },
  { id: "api-keys", name: "API Keys", icon: Key, href: "/settings/api-keys" },
  { id: "members", name: "Members", icon: Users, href: "/settings/members", isHidden: true, isDisabled: false },
  { id: "webhooks", name: "Webhooks", icon: Link2, href: "/settings/webhooks", isHidden: true, isDisabled: false },
  { id: "danger-zone", name: "Danger Zone", icon: Ban, href: "/settings/danger-zone" },
];

export const APP_RESERVED_SEGMENTS = ["get-started", "not-found", "profile", "projects"] as const;

export function getAppProjectPath(projectSlug: string, env?: string): string {
  const base = APP_BASE_PATH ? `${APP_BASE_PATH}/${projectSlug}` : `/${projectSlug}`;
  if (env) return `${base}/${env}`;
  return base;
}

export function getAppProjectSettingsPath(projectSlug: string): string {
  return APP_BASE_PATH ? `${APP_BASE_PATH}/${projectSlug}/settings` : `/${projectSlug}/settings`;
}

export function getProjectPathName(projectSlug: string, env: string, path: string): string {
  const p = path.startsWith("/") ? path.slice(1) : path;
  if (!p) return getAppProjectPath(projectSlug, env);
  return `${getAppProjectPath(projectSlug, env)}/${p}`;
}

export function getProjectSettingsPathName(projectSlug: string, path: string): string {
  const p = path.startsWith("/") ? path.slice(1) : path;
  const prefix = APP_BASE_PATH ? `${APP_BASE_PATH}/` : "/";
  return `${prefix}${projectSlug}/${p}`;
}

export function parseProjectEnvFromPath(pathname: string): {
  projectSlug: string | null;
  env: string | null;
  isSettings: boolean;
} {
  const rest = pathname.replace(/^\//, "");
  const segments = rest ? rest.split("/") : [];
  const first = segments[0] ?? null;
  const second = segments[1] ?? null;
  if (!first) return { projectSlug: null, env: null, isSettings: false };
  if (APP_RESERVED_SEGMENTS.includes(first as (typeof APP_RESERVED_SEGMENTS)[number])) {
    return { projectSlug: null, env: null, isSettings: false };
  }
  const isSettings = second === "settings";
  const envValues = ["development", "staging", "production"];
  const env = second && envValues.includes(second.toLowerCase()) ? second.toLowerCase() : null;
  return { projectSlug: first, env, isSettings };
}
