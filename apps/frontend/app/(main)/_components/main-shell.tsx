"use client";

import { useSyncAppUrl } from "@/hooks";

export function MainShell({ children }: { children: React.ReactNode }) {
  useSyncAppUrl();

  return <main className="min-h-0 flex-1 overflow-auto">{children}</main>;
}
