import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import {
  getStoredToken,
  LoginForm,
  setStoredToken,
} from "@/components/login-form";
import { ModeToggle } from "@/components/mode-toggle";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import Decorations from "@/components/ui/decorations";
import { getConstants } from "@/constants";
import { useAppViewStore, useRouteInUrl } from "@/hooks/use-tracelet-persistence";
import { flattenRoutesTree, type RouteMeta } from "@/types/route";
import { useIsMobile } from "@/hooks/use-mobile";

const LogsPage = React.lazy(() =>
  import("./logs-page").then((m) => ({ default: m.LogsPage })),
);
const RoutesPage = React.lazy(() =>
  import("./routes-page").then((m) => ({ default: m.RoutesPage })),
);
const RouteCommandPalette = React.lazy(() =>
  import("@/components/api-explorer/route-command-palette").then((m) => ({
    default: m.RouteCommandPalette,
  })),
);

const apiBase =
  (import.meta.env.TRACELET_DOC_API_ROUTE as string | undefined) ?? "";

export function DocsLayout() {
  const {
    getRouteFromUrl,
    setRouteInUrl,
  } = useRouteInUrl();
  const isMobile = useIsMobile();
  const { appView, setAppView } = useAppViewStore();
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
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [panelKey, setPanelKey] = React.useState(0);
  

  const { basePath } = getConstants();
  const baseUrl = apiBase.replace(/\/$/, "");
  const apiRoutePath = basePath.replace(/^\//, "").replace(/\/$/, "");
  const checkAuthUrl = `${baseUrl}/${apiRoutePath}/check-auth`;
  const authUrl = `${baseUrl}/${apiRoutePath}/auth`;
  const routesUrl = `${baseUrl}/${apiRoutePath}?json=true`;
  const logsUrl = `${baseUrl}/${apiRoutePath}/logs`;

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
          setAppView("api-explorer");
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
        setAppView("api-explorer");
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

  const showLoginDialog = authRequired && !token;

  return (
    <>
      {!authCheckDone && (
        <div className="absolute inset-0 flex min-h-screen items-center justify-center z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2Icon className="size-8 animate-spin" />
            <p className="text-sm">Checking authentication…</p>
          </div>
        </div>
      )}
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
      <AppSidebar
        routes={routes ?? []}
        selectedRoute={selectedRoute}
        onSelectRoute={handleSelectRoute}
        onRefresh={handleRefresh}
        apiBase={apiBase}
      />
      <SidebarInset className="min-w-0">
        <header className="flex h-(--header-height) shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 p-px pb-[2px] pr-[2px]">
          <div className="relative flex items-center justify-between w-full h-full px-2">
            <Decorations className="-z-10 absolute inset-0" />
            <SidebarTrigger disabled={!isMobile && appView === "logs"} />
            <div className="flex items-center gap-2">
              <React.Suspense fallback={null}>
                <RouteCommandPalette
                  open={commandOpen}
                  onOpenChange={setCommandOpen}
                  routes={flatRoutes}
                  onSelectRoute={handleSelectRoute}
                />
              </React.Suspense>
              <ModeToggle />
            </div>
          </div>
        </header>
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <React.Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                <Loader2Icon className="size-6 animate-spin" />
              </div>
            }
          >
            {appView === "logs" ? (
              <LogsPage logsUrl={logsUrl} token={token} />
            ) : (
              <RoutesPage
                loading={loading}
                error={error}
                routes={routes}
                routesUrl={routesUrl}
                hasRoutes={hasRoutes}
                selectedRoute={selectedRoute}
                panelKey={panelKey}
                apiBase={apiBase}
                token={token}
                fetchRoutes={fetchRoutes}
                onRefresh={handleRefresh}
              />
            )}
          </React.Suspense>
        </div>
      </SidebarInset>
    </>
  );
}
