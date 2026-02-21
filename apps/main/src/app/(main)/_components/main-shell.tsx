"use client";

import { useSyncAppUrl } from "@/features/project/use-sync-app-url";

export function MainShell({ children }: { children: React.ReactNode }) {
  useSyncAppUrl();
  return <main className="min-h-0 flex-1 overflow-auto scrollbar-gutter relative">{children}</main>;
}
