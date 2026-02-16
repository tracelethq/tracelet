import * as React from "react";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";

import {
  ApiDetailsPanel,
  type ApiDetailsPanelProps,
} from "@/components/api-details-panel";
import { EmptyRoutesState } from "@/components/empty-routes-state";
import {
  getStoredToken,
  LoginForm,
  setStoredToken,
} from "@/components/login-form";
import { ModeToggle } from "@/components/mode-toggle";
import { RouteCommandPalette } from "@/components/route-command-palette";
import { RoutesSidebar } from "@/components/routes-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useRouteInUrl } from "@/hooks/use-tracelet-persistence";
import { flattenRoutesTree, type RouteMeta } from "@/types/route";
import Decorations from "./ui/decorations";

const apiBase =
  (import.meta.env.TRACELET_DOC_API_ROUTE as string | undefined) ?? "";

export function RoutesPage() {
  const { getRouteFromUrl, setRouteInUrl } = useRouteInUrl();
  const [routes, setRoutes] = React.useState<RouteMeta[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = React.useState<RouteMeta | null>(
    null,
  );
  const [authCheckDone, setAuthCheckDone] = React.useState(false);
  const [authRequired, setAuthRequired] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(() =>
    getStoredToken(),
  );

  const baseUrl = apiBase.replace(/\/$/, "");
  const checkAuthUrl = `${baseUrl}/tracelet-docs/check-auth`;
  const authUrl = `${baseUrl}/tracelet-docs/auth`;
  const routesUrl = `${baseUrl}/tracelet-docs?json=true`;

  const fetchRoutes = React.useCallback(
    async (authToken: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {};
        if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
        const res = await fetch(routesUrl, {
          headers: Object.keys(headers).length ? headers : undefined,
        });
        if (res.status === 401) {
          setStoredToken(null);
          setToken(null);
          setAuthRequired(true);
          setRoutes(null);
          setSelectedRoute(null);
          setRouteInUrl(null);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setRoutes(list);
        const flat = flattenRoutesTree(list);
        const urlRouteKey = getRouteFromUrl();
        const urlRouteKeyDecoded = urlRouteKey
          ? decodeURIComponent(urlRouteKey)
          : null;
        const fromUrl =
          urlRouteKeyDecoded &&
          flat.find(
            (r: RouteMeta) => `${r.method}:${r.path}` === urlRouteKeyDecoded,
          );
        setSelectedRoute((prev) => {
          if (fromUrl) return fromUrl;
          const match =
            prev &&
            flat.find(
              (r: RouteMeta) =>
                r.path === prev.path && r.method === prev.method,
            );
          return match ?? flat[0] ?? null;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch routes");
        setRoutes([]);
        setSelectedRoute(null);
        setRouteInUrl(null);
      } finally {
        setLoading(false);
      }
    },
    [routesUrl, getRouteFromUrl],
  );

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(checkAuthUrl);
        const data = await res.json().catch(() => ({}));
        if (!cancelled) {
          setAuthRequired(Boolean(data.authRequired));
          setAuthCheckDone(true);
        }
      } catch {
        if (!cancelled) {
          setAuthRequired(false);
          setAuthCheckDone(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [checkAuthUrl]);

  const handleSelectRoute = React.useCallback(
    (route: RouteMeta) => {
      setSelectedRoute(route);
      setRouteInUrl(`${route.method}:${route.path}`);
    },
    [setRouteInUrl],
  );

  React.useEffect(() => {
    if (!authCheckDone) return;
    if (authRequired && !token) return;
    fetchRoutes(token);
  }, [authCheckDone, authRequired, token, fetchRoutes]);

  const flatRoutes = React.useMemo(
    () => (routes ? flattenRoutesTree(routes) : []),
    [routes],
  );
  const hasRoutes = flatRoutes.length > 0;
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [panelKey, setPanelKey] = React.useState(0);

  const handleRefresh = React.useCallback(() => {
    setPanelKey((k) => k + 1);
    fetchRoutes(token);
  }, [fetchRoutes, token]);

  const handleLoginSuccess = React.useCallback(
    (newToken: string) => {
      setToken(newToken || null);
      if (newToken) fetchRoutes(newToken);
      else fetchRoutes(null);
    },
    [fetchRoutes],
  );

  // When route in URL no longer exists in fetched routes, sync URL to selected route
  React.useEffect(() => {
    if (!routes?.length || flatRoutes.length === 0) return;
    const urlRouteKey = getRouteFromUrl();
    if (!urlRouteKey) return;
    const decoded = decodeURIComponent(urlRouteKey);
    const exists = flatRoutes.some((r) => `${r.method}:${r.path}` === decoded);
    if (!exists) {
      setRouteInUrl(
        selectedRoute ? `${selectedRoute.method}:${selectedRoute.path}` : null,
      );
    }
  }, [routes, flatRoutes, selectedRoute, getRouteFromUrl, setRouteInUrl]);

  if (!authCheckDone) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2Icon className="size-8 animate-spin" />
          <p className="text-sm">Checking authentication…</p>
        </div>
      </div>
    );
  }

  const showLoginDialog = authRequired && !token;

  return (
    <>
      <Dialog open={showLoginDialog}>
        <DialogContent
          className="sm:max-w-sm"
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <LoginForm
            embedded
            authUrl={authUrl}
            onSuccess={handleLoginSuccess}
          />
        </DialogContent>
      </Dialog>
      <RoutesSidebar
        routes={routes ?? []}
        selectedRoute={selectedRoute}
        onSelectRoute={handleSelectRoute}
        onRefresh={handleRefresh}
        apiBase={apiBase}
      />
      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 p-px pb-[2px] pr-[2px]">
          <div className="relative flex items-center justify-between w-full h-full">
            <Decorations className="-z-10 absolute inset-0" />
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <RouteCommandPalette
                open={commandOpen}
                onOpenChange={setCommandOpen}
                routes={flatRoutes}
                onSelectRoute={handleSelectRoute}
              />
              <ModeToggle />
            </div>
          </div>
        </header>
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* Full-screen loading only on initial load (no routes yet); keep panel mounted during refresh */}
          {loading && !routes?.length && (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2Icon className="size-8 animate-spin" />
                <p className="text-sm">Loading routes…</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-1 items-center justify-center p-4">
              <div className="w-full max-w-md min-w-[min(100%,18rem)]">
                <Card className="w-full border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">
                      Connection error
                    </CardTitle>
                    <CardDescription className="wrap-break-word">
                      Could not fetch routes from {routesUrl}. {error}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={() => fetchRoutes(token)}
                    >
                      <RefreshCwIcon className="size-4" />
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {!loading && !error && !hasRoutes && (
            <div className="flex flex-1 items-center justify-center p-4">
              <div className="w-full max-w-md">
                <EmptyRoutesState onRefresh={handleRefresh} />
              </div>
            </div>
          )}

          {/* Keep panel mounted when we have a selected route (including during refresh so params/body aren't lost) */}
          {!error && hasRoutes && selectedRoute && (
            <ApiDetailsPanel
              key={panelKey}
              {...({
                route: selectedRoute,
                apiBase,
              } satisfies ApiDetailsPanelProps)}
            />
          )}

          {/* Refresh in progress: show overlay so panel stays mounted and keeps state */}
          {loading && hasRoutes && selectedRoute && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
              <div className="flex flex-col items-center gap-2 rounded-lg border bg-card px-4 py-3 shadow-sm">
                <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Refreshing routes…
                </span>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </>
  );
}
