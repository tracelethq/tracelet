import { Loader2Icon, RefreshCwIcon } from "lucide-react";

import {
  ApiDetailsPanel,
  type ApiDetailsPanelProps,
} from "@/components/api-explorer/api-details-panel";
import { EmptyRoutesState } from "@/components/api-explorer/empty-routes-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RouteMeta } from "@/types/route";

export interface RoutesPageProps {
  loading: boolean;
  error: string | null;
  routes: RouteMeta[] | null;
  routesUrl: string;
  hasRoutes: boolean;
  selectedRoute: RouteMeta | null;
  panelKey: number;
  apiBase: string;
  token: string | null;
  fetchRoutes: (authToken: string | null) => void;
  onRefresh: () => void;
}

export function RoutesPage({
  loading,
  error,
  routes,
  routesUrl,
  hasRoutes,
  selectedRoute,
  panelKey,
  apiBase,
  token,
  fetchRoutes,
  onRefresh,
}: RoutesPageProps) {
  return (
    <>
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
            <EmptyRoutesState onRefresh={onRefresh} />
          </div>
        </div>
      )}

      {!error && hasRoutes && selectedRoute && (
        <ApiDetailsPanel
          key={panelKey}
          {...({
            route: selectedRoute,
            apiBase,
          } satisfies ApiDetailsPanelProps)}
        />
      )}

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
    </>
  );
}
