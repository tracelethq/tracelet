"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useProjectsQuery } from "@/features/project";
import {
  useApiExplorerQuery,
  flattenRoutes,
  type FlattenedRoute,
  type TraceletProperty,
  type TraceletResponseProperty,
} from "@/features/api-explorer";
import { ENV_OPTIONS } from "@/features/project/constants";
import { FolderOpen, Loader2, ChevronDown, ChevronRight } from "lucide-react";

function methodColor(method: string): string {
  switch (method) {
    case "GET":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    case "POST":
      return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    case "PUT":
    case "PATCH":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    case "DELETE":
      return "bg-red-500/20 text-red-400 border-red-500/40";
    case "HEAD":
    case "OPTIONS":
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/40";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function PropertyTable({
  title,
  properties,
}: {
  title: string;
  properties: TraceletProperty[];
}) {
  if (!properties?.length) return null;
  return (
    <div className="mb-3">
      <h5 className="mb-1.5 text-xs font-semibold text-zinc-400">{title}</h5>
      <div className="overflow-x-auto rounded border border-border bg-muted/20">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-1.5 font-medium text-zinc-400">Name</th>
              <th className="px-3 py-1.5 font-medium text-zinc-400">Type</th>
              <th className="px-3 py-1.5 font-medium text-zinc-400">
                Required
              </th>
              <th className="px-3 py-1.5 font-medium text-zinc-400">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr
                key={p.name}
                className="border-b border-border/50 last:border-0"
              >
                <td className="px-3 py-1.5 font-mono text-cyan-400">
                  {p.name}
                </td>
                <td className="px-3 py-1.5 text-zinc-300">{p.type}</td>
                <td className="px-3 py-1.5 text-zinc-400">
                  {p.required ? "Yes" : "—"}
                </td>
                <td className="px-3 py-1.5 text-zinc-500">{p.desc ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResponseBlock({ res }: { res: TraceletResponseProperty }) {
  return (
    <div className="mb-2 rounded border border-border bg-muted/20 p-2">
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className={
            res.status >= 200 && res.status < 300
              ? "text-emerald-400"
              : res.status >= 400
                ? "text-red-400"
                : "text-amber-400"
          }
        >
          {res.status}
        </span>
        {res.description && (
          <span className="text-xs text-zinc-500">{res.description}</span>
        )}
      </div>
      {res.properties?.length > 0 && (
        <PropertyTable title="Response body" properties={res.properties} />
      )}
    </div>
  );
}

function RouteDetails({ route }: { route: FlattenedRoute }) {
  return (
    <div className="space-y-3 border-t border-border pt-3">
      {route.description && (
        <p className="text-sm text-zinc-400">{route.description}</p>
      )}
      {route.requestContentType && (
        <p className="text-xs text-zinc-500">
          Request content type:{" "}
          <span className="font-mono">{route.requestContentType}</span>
        </p>
      )}
      {route.tags?.length && (
        <div className="flex flex-wrap gap-1">
          {route.tags.map((t) => (
            <span
              key={t}
              className="rounded bg-muted px-1.5 py-0.5 text-xs text-zinc-500"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <PropertyTable title="Request body" properties={route.request ?? []} />
      <PropertyTable title="Query parameters" properties={route.query ?? []} />
      <PropertyTable title="Path parameters" properties={route.params ?? []} />
      {route.responses?.length ? (
        <div>
          <h5 className="mb-1.5 text-xs font-semibold text-zinc-400">
            Responses
          </h5>
          <div className="space-y-1">
            {route.responses.map((res) => (
              <ResponseBlock key={res.status} res={res} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function routeKey(route: FlattenedRoute): string {
  return `${route.method}:${route.fullPath}`;
}

export default function ApiExplorerPage() {
  const params = useParams();
  const projectSlug = params.projectSlug as string;
  const envFromUrl = (params.environment as string) ?? "development";
  const currentEnvId = ENV_OPTIONS.some((e) => e.id === envFromUrl)
    ? envFromUrl
    : ENV_OPTIONS[0].id;

  const { data: projects, isLoading: projectsLoading } = useProjectsQuery();
  const project = projects?.find((p) => p.slug === projectSlug);
  const organizationId = project?.id;

  const { data, isLoading, error } = useApiExplorerQuery(
    organizationId,
    currentEnvId,
  );
  const routes = useMemo(() => {
    const raw = data?.data;
    if (!raw || typeof raw !== "object") return [];
    // SDK sends apiExplorer as { routes: TraceletMeta[] }; support both that and a raw array
    const list = Array.isArray(raw)
      ? raw
      : (raw as { routes?: unknown[] }).routes;
    if (!Array.isArray(list)) return [];
    return flattenRoutes(list as Parameters<typeof flattenRoutes>[0]);
  }, [data?.data]);

  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const expandedRoute = useMemo(
    () =>
      expandedKey ? routes.find((r) => routeKey(r) === expandedKey) : null,
    [expandedKey, routes],
  );

  if (projectsLoading || !project) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-6 flex-1 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 p-6">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : routes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <FolderOpen className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No API routes yet. Add Tracelet to your server and use
            tracelet.doc.json or route meta so routes appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-background">
          <div className="flex items-center gap-2 border-b bg-background rounded-t-lg px-4 py-2 sticky top-0 right-0 z-10">
            <FolderOpen className="size-4 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-400">
              {routes.length} {routes.length === 1 ? "route" : "routes"}
            </span>
          </div>
          <div className="p-2">
            {routes.map((route) => {
              const key = routeKey(route);
              const isExpanded = expandedKey === key;
              return (
                <div
                  key={key}
                  className="rounded border-b border-border/50 last:border-0"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedKey((prev) => (prev === key ? null : key))
                    }
                    className="flex w-full items-center gap-2 py-2.5 pl-2 pr-3 text-left hover:bg-muted/40"
                  >
                    <span className="shrink-0 text-zinc-500">
                      {isExpanded ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </span>
                    <span
                      className={`shrink-0 rounded border px-1.5 py-0.5 text-xs font-semibold ${methodColor(route.method)}`}
                    >
                      {route.method}
                    </span>
                    <span className="min-w-0 truncate font-mono text-sm text-zinc-300">
                      {route.fullPath}
                    </span>
                  </button>
                  {isExpanded && expandedRoute && (
                    <div className="border-t border-border/50 bg-muted/20 px-4 pb-3 pt-2">
                      <RouteDetails route={expandedRoute} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
