"use client";

import * as React from "react";

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const toggle = React.useCallback(() => setCollapsed((p) => !p), []);
  const value = React.useMemo(
    () => ({
      collapsed,
      setCollapsed: (v: boolean | ((prev: boolean) => boolean)) =>
        setCollapsed(typeof v === "function" ? v(collapsed) : v),
      toggle,
    }),
    [collapsed, toggle]
  );
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
