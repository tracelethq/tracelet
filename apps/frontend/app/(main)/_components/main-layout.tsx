"use client";

import { useAppStore } from "@/store";

import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        {children}
      </div>
    </div>
  );
}
