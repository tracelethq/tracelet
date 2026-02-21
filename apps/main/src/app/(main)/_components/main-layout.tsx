"use client";

import { Sidebar } from "./sidebar";
import { TopBar } from "@/app/(main)/_components/top-bar";
import EnvWrapper from "@/features/project/components/env-wrapper";
import { SidebarProvider } from "@/contexts/sidebar-context";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <EnvWrapper>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <TopBar />
            {children}
          </div>
        </div>
      </EnvWrapper>
    </SidebarProvider>
  );
}
