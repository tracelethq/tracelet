import * as React from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  RouteIcon,
  RefreshCwIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSidebarOpenKeys } from "@/hooks/use-tracelet-persistence";
import { flattenRoutesTree, type RouteMeta } from "@/types/route";

interface RoutesSidebarProps {
  /** Tree of routes (nested). Each node has path already resolved. */
  routes: RouteMeta[];
  selectedRoute: RouteMeta | null;
  onSelectRoute: (route: RouteMeta) => void;
  onRefresh: () => void;
  /** Base URL for the API (used to show full fetch URL under each route path). */
  apiBase?: string;
}

/** Build full URL from base and path. */
function fullUrl(apiBase: string, path: string): string {
  const base = apiBase.replace(/\/+$/, "") || "";
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

function routeKey(route: RouteMeta): string {
  return `${route.method}:${route.path}`;
}

/** Single route row (no children): clickable button. */
function RouteButton({
  route,
  apiBase,
  isSelected,
  onSelect,
}: {
  route: RouteMeta;
  apiBase: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const method =
    typeof route.method === "string" ? route.method : String(route.method);
  const path = typeof route.path === "string" ? route.path || "/" : "/";
  const methodInitial = method.charAt(0).toUpperCase();
  const url = fullUrl(apiBase, path);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isSelected}
        onClick={onSelect}
        tooltip={`${method} ${path}`}
        className="flex flex-col items-start gap-0.5 py-2 group-data-[collapsible=icon]:justify-center!"
      >
        <div className="flex w-full min-w-0 items-center gap-1.5 group-data-[collapsible=icon]:justify-center">
          <span className="hidden size-6 shrink-0 items-center justify-center rounded bg-sidebar-accent font-mono text-[10px] font-medium text-sidebar-accent-foreground group-data-[collapsible=icon]:flex!">
            {methodInitial}
          </span>
          <Badge
            variant="secondary"
            className="font-mono text-[10px] h-5 min-w-9 shrink-0 justify-center px-1 group-data-[collapsible=icon]:hidden!"
          >
            {method}
          </Badge>
          <span className="truncate font-mono text-xs group-data-[collapsible=icon]:hidden">
            {path}
          </span>
        </div>
        {url && (
          <span className="text-muted-foreground truncate pl-7 text-[10px] font-mono group-data-[collapsible=icon]:hidden! w-full text-left">
            {url}
          </span>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/** Recursive tree node: collapsible if has children, else route button. */
function RouteNode({
  route,
  apiBase,
  selectedRoute,
  onSelectRoute,
  openKeys,
  onToggleOpen,
  depth = 0,
}: {
  route: RouteMeta;
  apiBase: string;
  selectedRoute: RouteMeta | null;
  onSelectRoute: (route: RouteMeta) => void;
  openKeys: Set<string>;
  onToggleOpen: (key: string) => void;
  depth?: number;
}) {
  const key = routeKey(route);
  const hasChildren = route.routes && route.routes.length > 0;
  const isOpen = openKeys.has(key);
  const isSelected =
    selectedRoute?.method === route.method &&
    selectedRoute?.path === route.path;

  if (!hasChildren) {
    return (
      <RouteButton
        route={route}
        apiBase={apiBase}
        isSelected={!!isSelected}
        onSelect={() => onSelectRoute(route)}
      />
    );
  }

  const method =
    typeof route.method === "string" ? route.method : String(route.method);
  const path = typeof route.path === "string" ? route.path || "/" : "/";
  const pl = 2 + depth * 2;

  return (
    <SidebarGroup key={key}>
      <SidebarGroupLabel asChild>
        <button
          type="button"
          onClick={() => onToggleOpen(key)}
          className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-sidebar-foreground outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          style={{ paddingLeft: `${pl * 4}px` }}
        >
          {method !== "PARENT" && (
            <Badge
              variant="secondary"
              className="font-mono text-[10px] h-5 min-w-9 shrink-0 justify-center px-1"
            >
              {method}
            </Badge>
          )}
          <div className="w-full flex items-center justify-between">
            <span className="truncate font-mono text-xs">{path}</span>
            {isOpen ? (
              <ChevronDownIcon className="size-3.5 shrink-0" />
            ) : (
              <ChevronRightIcon className="size-3.5 shrink-0" />
            )}
          </div>
        </button>
      </SidebarGroupLabel>
      {isOpen && (
        <SidebarGroupContent className="px-2">
          <SidebarMenu>
            {route.routes!.map((child, i) => (
              <RouteNode
                key={`${routeKey(child)}-${i}`}
                route={child}
                apiBase={apiBase}
                selectedRoute={selectedRoute}
                onSelectRoute={onSelectRoute}
                openKeys={openKeys}
                onToggleOpen={onToggleOpen}
                depth={depth + 1}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}

export function RoutesSidebar({
  routes,
  selectedRoute,
  onSelectRoute,
  onRefresh,
  apiBase = "",
}: RoutesSidebarProps) {
  const totalCount = React.useMemo(
    () => flattenRoutesTree(routes).length,
    [routes],
  );
  const [openKeys, , toggleOpen] = useSidebarOpenKeys();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex w-full min-w-0 items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <RouteIcon className="size-5 shrink-0 text-sidebar-foreground" />
          <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">API Routes</span>
            <span className="text-sidebar-foreground/70 truncate text-xs font-normal">
              {totalCount} endpoint{totalCount === 1 ? "" : "s"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="size-7 shrink-0 group-data-[collapsible=icon]:hidden"
          >
            <RefreshCwIcon className="size-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {routes.map((route, i) => (
          <RouteNode
            key={`${routeKey(route)}-${i}`}
            route={route}
            apiBase={apiBase}
            selectedRoute={selectedRoute}
            onSelectRoute={onSelectRoute}
            openKeys={openKeys}
            onToggleOpen={toggleOpen}
          />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
