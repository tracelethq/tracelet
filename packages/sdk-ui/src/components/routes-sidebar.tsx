import * as React from "react";
import { ChevronRightIcon, RouteIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSidebarOpenKeys } from "@/hooks/use-tracelet-persistence";
import { flattenRoutesTree, type RouteMeta } from "@/types/route";
import { cn } from "@/lib/utils";
import { Logo } from "./icons/logo";
import Decorations from "./ui/decorations";

/** HTTP method colors (Swagger/Postman-style). Returns className for badge/pill. */
export function getMethodColors(method: string): string {
  const m = method.toUpperCase();
  const base = "font-mono text-[10px] font-semibold rounded border shrink-0 ";
  switch (m) {
    case "GET":
      return (
        base +
        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/30"
      );
    case "POST":
      return (
        base +
        "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 dark:border-blue-500/30"
      );
    case "PUT":
      return (
        base +
        "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/30"
      );
    case "PATCH":
      return (
        base +
        "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30 dark:border-violet-500/30"
      );
    case "DELETE":
      return (
        base +
        "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 dark:border-red-500/30"
      );
    case "HEAD":
    case "OPTIONS":
    case "PARENT":
    default:
      return base + "bg-muted text-muted-foreground border-border";
  }
}

interface RoutesSidebarProps {
  /** Tree of routes (nested). Each node has path already resolved. */
  routes: RouteMeta[];
  selectedRoute: RouteMeta | null;
  onSelectRoute: (route: RouteMeta) => void;
  onRefresh: () => void;
  /** Base URL for the API (used to show full fetch URL under each route path). */
  apiBase?: string;
}

function routeKey(route: RouteMeta): string {
  return `${route.method}:${route.path}`;
}

/** Single route row (no children): clickable button. */
function RouteButton({
  route,
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
  const methodClass = getMethodColors(method);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isSelected}
        onClick={onSelect}
        tooltip={`${method} ${path}`}
        className="flex flex-col items-stretch gap-1 group-data-[collapsible=icon]:justify-center! h-9 cursor-pointer"
      >
        <div className="flex w-full min-w-0 items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <span
            className={cn(
              "hidden size-6 shrink-0 items-center justify-center rounded border font-mono text-[10px] font-semibold group-data-[collapsible=icon]:flex!",
              methodClass,
            )}
          >
            {methodInitial}
          </span>
          <span
            className={cn(
              "h-5 min-w-9 flex items-center justify-center px-1.5 group-data-[collapsible=icon]:hidden!",
              methodClass,
            )}
          >
            {method}
          </span>
          <span className="min-w-0 truncate font-mono text-xs text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            {path}
          </span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/** Render trigger content (method badge + path + optional chevron) for a route. */
function RouteTriggerContent({
  route,
  showChevron = false,
}: {
  route: RouteMeta;
  showChevron?: boolean;
}) {
  const method =
    typeof route.method === "string" ? route.method : String(route.method);
  const path = typeof route.path === "string" ? route.path || "/" : "/";
  const methodInitial = method.charAt(0).toUpperCase();
  const methodClass = getMethodColors(method);
  return (
    <div className="flex w-full min-w-0 items-center gap-2 group-data-[collapsible=icon]:justify-center">
      {/* Icon mode: single compact badge with initial, or RouteIcon for PARENT */}
      <span
        className={cn(
          "hidden size-6 shrink-0 items-center justify-center rounded border font-mono text-[10px] font-semibold group-data-[collapsible=icon]:flex!",
          methodClass,
        )}
      >
        {method === "PARENT" ? (
          <RouteIcon className="size-3.5" />
        ) : (
          methodInitial
        )}
      </span>
      {/* Expanded: method badge + path */}
      <span
        className={cn(
          "h-5 min-w-9 flex items-center justify-center px-1.5 shrink-0 group-data-[collapsible=icon]:hidden!",
          methodClass,
        )}
      >
        {method === "PARENT" ? <RouteIcon className="size-4" /> : method}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-xs group-data-[collapsible=icon]:hidden">
        {path}
      </span>
      {showChevron && (
        <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
      )}
    </div>
  );
}

/** Recursive tree node: Collapsible if has children, else route button. */
function RouteNode({
  route,
  apiBase,
  selectedRoute,
  onSelectRoute,
  openKeys,
  onToggleOpen,
  asSubItem = false,
}: {
  route: RouteMeta;
  apiBase: string;
  selectedRoute: RouteMeta | null;
  onSelectRoute: (route: RouteMeta) => void;
  openKeys: Set<string>;
  onToggleOpen: (key: string) => void;
  asSubItem?: boolean;
}) {
  const key = routeKey(route);
  const hasChildren = route.routes && route.routes.length > 0;
  const isOpen = openKeys.has(key);
  const isSelected =
    selectedRoute?.method === route.method &&
    selectedRoute?.path === route.path;
  const method =
    typeof route.method === "string" ? route.method : String(route.method);
  const path = typeof route.path === "string" ? route.path || "/" : "/";

  if (!hasChildren) {
    if (asSubItem) {
      return (
        <SidebarMenuSubItem>
          <SidebarMenuSubButton
            isActive={!!isSelected}
            onClick={() => onSelectRoute(route)}
            className="cursor-pointer"
          >
            <span
              className={cn(
                "h-5 min-w-9 flex items-center justify-center px-1.5 shrink-0",
                getMethodColors(method),
              )}
            >
              {method}
            </span>
            <span className="min-w-0 truncate font-mono text-xs">{path}</span>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      );
    }
    return (
      <RouteButton
        route={route}
        apiBase={apiBase}
        isSelected={!!isSelected}
        onSelect={() => onSelectRoute(route)}
      />
    );
  }

  const collapsibleContent = (
    <Collapsible
      open={isOpen}
      onOpenChange={(open) => {
        if (open !== isOpen) onToggleOpen(key);
      }}
      className="group/collapsible"
    >
      <CollapsibleTrigger asChild>
        <SidebarMenuButton
          tooltip={`${method} ${path}`}
          className="flex flex-col items-stretch gap-1 group-data-[collapsible=icon]:justify-center! h-9"
        >
          <RouteTriggerContent route={route} showChevron />
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {route.routes!.map((child, i) => (
            <RouteNode
              key={`${routeKey(child)}-${i}`}
              route={child}
              apiBase={apiBase}
              selectedRoute={selectedRoute}
              onSelectRoute={onSelectRoute}
              openKeys={openKeys}
              onToggleOpen={onToggleOpen}
              asSubItem
            />
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );

  if (asSubItem) {
    return <SidebarMenuSubItem>{collapsibleContent}</SidebarMenuSubItem>;
  }

  return <SidebarMenuItem>{collapsibleContent}</SidebarMenuItem>;
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
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar/80 p-px h-(--header-height)">
        <div className="flex w-full min-w-0 items-center gap-3 px-3 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 relative">
          <Decorations />
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-accent-foreground">
            <Logo />
          </div>
          <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              API Routes
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {totalCount} endpoint{totalCount === 1 ? "" : "s"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="size-8 shrink-0 rounded-md group-data-[collapsible=icon]:hidden"
          >
            <RefreshCwIcon className="size-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0.5 p-[2px] pt-0">
        <div className="relative h-full">
          <Decorations />
          <SidebarMenu className="relative h-full overflow-auto">
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
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
