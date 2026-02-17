"use client";

import { createContext, useContext } from "react";

import { useSession } from "@/features/auth";

type GlobalLoadingContextValue = {
  isUserLoading: boolean;
};

const GlobalLoadingContext = createContext<GlobalLoadingContextValue>({
  isUserLoading: false,
});

export function useGlobalLoading() {
  return useContext(GlobalLoadingContext);
}

function GlobalLoadingOverlay() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    </div>
  );
}

export function GlobalLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isPending } = useSession();
  const value: GlobalLoadingContextValue = { isUserLoading: isPending };

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
      {isPending && <GlobalLoadingOverlay />}
    </GlobalLoadingContext.Provider>
  );
}
