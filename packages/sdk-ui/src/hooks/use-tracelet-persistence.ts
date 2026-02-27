import * as React from "react";
import type { ApiTabValue } from "@/components/api-explorer/api-details/types";
import type { AppView } from "@/components/api-explorer/routes-sidebar";
import { create } from "zustand";

const ROUTE_URL_PARAM = "route";
const TAB_URL_PARAM = "tab";
const RESPONSE_TAB_URL_PARAM = "responseTab";
const STORAGE_KEY_TAB_BY_ROUTE = "tracelet-docs-tabByRoute";
const STORAGE_KEY_RESPONSE_TAB = "tracelet-docs-responseTabByRoute";
const STORAGE_KEY_SIDEBAR_OPEN = "tracelet-docs-sidebarOpenKeys";
const APP_ACTIVE_VIEW = "activeView";

function getInitialAppViewFromUrl(): AppView {
  if (typeof window === "undefined") return "api-explorer";
  const v = new URLSearchParams(window.location.search).get(APP_ACTIVE_VIEW);
  return v === "logs" || v === "api-explorer" ? v : "api-explorer";
}

/** Selected route and optional tab in URL (shareable). */
export function useRouteInUrl() {
  const getRouteFromUrl = React.useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(ROUTE_URL_PARAM);
  }, []);

  const setRouteInUrl = React.useCallback((routeKey: string | null) => {
    const url = new URL(window.location.href);
    if (routeKey) url.searchParams.set(ROUTE_URL_PARAM, routeKey);
    else url.searchParams.delete(ROUTE_URL_PARAM);
    window.history.replaceState(null, "", url.toString());
  }, []);

  const getTabFromUrl = React.useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(TAB_URL_PARAM);
  }, []);

  const setTabInUrl = React.useCallback((tab: string | null) => {
    const url = new URL(window.location.href);
    if (tab) url.searchParams.set(TAB_URL_PARAM, tab);
    else url.searchParams.delete(TAB_URL_PARAM);
    window.history.replaceState(null, "", url.toString());
  }, []);

  const getResponseTabFromUrl = React.useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(
      RESPONSE_TAB_URL_PARAM,
    );
  }, []);

  const setResponseTabInUrl = React.useCallback((value: string | null) => {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(RESPONSE_TAB_URL_PARAM, value);
    else url.searchParams.delete(RESPONSE_TAB_URL_PARAM);
    window.history.replaceState(null, "", url.toString());
  }, []);

  return {
    getRouteFromUrl,
    setRouteInUrl,
    getTabFromUrl,
    setTabInUrl,
    getResponseTabFromUrl,
    setResponseTabInUrl,
  };
}

export const useAppViewStore = create<{
  appView: AppView;
  setAppView: (appView: AppView) => void;
}>((set) => ({
  appView: getInitialAppViewFromUrl(),
  setAppView: (appView: AppView) => {
    set({ appView });
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (appView) url.searchParams.set(APP_ACTIVE_VIEW, appView);
    else url.searchParams.delete(APP_ACTIVE_VIEW);
    window.history.replaceState(null, "", url.toString());
  },
}));

/** Main tab (Params/Body/Headers/Authorization) per route, persisted in localStorage. */
export function useTabByRoute() {
  const load = React.useCallback((): Record<string, ApiTabValue> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TAB_BY_ROUTE);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        return parsed as Record<string, ApiTabValue>;
      }
    } catch {
      // ignore
    }
    return {};
  }, []);

  const [tabByRoute, setTabByRouteState] =
    React.useState<Record<string, ApiTabValue>>(load);

  const setTabByRoute = React.useCallback(
    (update: React.SetStateAction<Record<string, ApiTabValue>>) => {
      setTabByRouteState((prev) => {
        const next = typeof update === "function" ? update(prev) : update;
        try {
          localStorage.setItem(STORAGE_KEY_TAB_BY_ROUTE, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [],
  );

  return [tabByRoute, setTabByRoute] as const;
}

export type ResponseTabValue = "response" | "headers";

/** Response panel tab (Response/Headers) per route: localStorage + URL. */
export function useResponseTab(routeKey: string) {
  const { getResponseTabFromUrl, setResponseTabInUrl } = useRouteInUrl();

  const load = React.useCallback((): ResponseTabValue => {
    // Prefer per-route localStorage so switching APIs doesn't copy the previous route's tab
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RESPONSE_TAB);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, ResponseTabValue>;
        if (parsed[routeKey] === "headers" || parsed[routeKey] === "response") {
          return parsed[routeKey];
        }
      }
    } catch {
      // ignore
    }
    // Then URL (e.g. shared link or first visit)
    const fromUrl = getResponseTabFromUrl();
    if (fromUrl === "headers" || fromUrl === "response") return fromUrl;
    return "response";
  }, [routeKey, getResponseTabFromUrl]);

  const [responseTab, setResponseTabState] =
    React.useState<ResponseTabValue>(load);

  React.useEffect(() => {
    const value = load();
    setResponseTabState(value);
    setResponseTabInUrl(value);
    // Persist to localStorage so this route keeps the value (e.g. when loaded from URL)
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RESPONSE_TAB);
      const data: Record<string, ResponseTabValue> = raw ? JSON.parse(raw) : {};
      data[routeKey] = value;
      localStorage.setItem(STORAGE_KEY_RESPONSE_TAB, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [routeKey, load, setResponseTabInUrl]);

  const setResponseTab = React.useCallback(
    (value: ResponseTabValue) => {
      setResponseTabState(value);
      setResponseTabInUrl(value);
      try {
        const raw = localStorage.getItem(STORAGE_KEY_RESPONSE_TAB);
        const data: Record<string, ResponseTabValue> = raw
          ? JSON.parse(raw)
          : {};
        data[routeKey] = value;
        localStorage.setItem(STORAGE_KEY_RESPONSE_TAB, JSON.stringify(data));
      } catch {
        // ignore
      }
    },
    [routeKey, setResponseTabInUrl],
  );

  return [responseTab, setResponseTab] as const;
}

/** Sidebar expand/collapse state (which route groups are open), persisted in localStorage. */
export function useSidebarOpenKeys() {
  const load = React.useCallback((): Set<string> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SIDEBAR_OPEN);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        return Array.isArray(arr) ? new Set(arr) : new Set();
      }
    } catch {
      // ignore
    }
    return new Set();
  }, []);

  const [openKeys, setOpenKeys] = React.useState<Set<string>>(load);

  React.useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_SIDEBAR_OPEN,
        JSON.stringify([...openKeys]),
      );
    } catch {
      // ignore
    }
  }, [openKeys]);

  const toggleOpen = React.useCallback((key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return [openKeys, setOpenKeys, toggleOpen] as const;
}
