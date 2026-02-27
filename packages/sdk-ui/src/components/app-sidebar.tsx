"use client";

import { FileTextIcon, RouteIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons/logo";
import { RoutesSidebar, type AppView } from "@/components/api-explorer/routes-sidebar";
import type { RouteMeta } from "@/types/route";
import { useEffect } from "react";
import { useAppViewStore } from "@/hooks/use-tracelet-persistence";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppSidebarProps {
  routes: RouteMeta[];
  selectedRoute: RouteMeta | null;
  onSelectRoute: (route: RouteMeta) => void;
  onRefresh: () => void;
  apiBase?: string;
}

const navMain: { title: string; view: AppView; icon: typeof RouteIcon }[] = [
  { title: "API Explorer", view: "api-explorer", icon: RouteIcon },
  { title: "Logs", view: "logs", icon: FileTextIcon },
];

export function AppSidebar({
  routes,
  selectedRoute,
  onSelectRoute,
  onRefresh,
  apiBase = "",
}: AppSidebarProps) {
  const { setOpen, open } = useSidebar();
  const { appView, setAppView } = useAppViewStore();
  const isMobile = useIsMobile();
  const handleOpenChange = (view: AppView) => {
    if (view === "logs") {
      setOpen(false);
      return;
    }
  };

  const handleViewChange = (view: AppView) => {
    setAppView(view);
  };

  useEffect(() => {
    handleOpenChange(appView);
  }, [appView, open]);
  console.log(appView);

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
    >
      {/* First sidebar: icon-only nav (sidebar-09 style) */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r border-sidebar-border"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="md:h-8 md:p-0 cursor-default"
              >
                <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shrink-0">
                  <Logo width={24} height={24} />
                </div>
                {/* Icon-only strip: brand text hidden so width stays narrow */}
                <div className="sr-only flex-1 flex-col text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-medium">Tracelet</span>
                  <span className="truncate text-xs text-sidebar-primary-foreground/80">
                    Docs
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{ children: item.title, hidden: false }}
                      onClick={() => {
                        handleViewChange(item.view);
                        setOpen(true);
                      }}
                      isActive={appView === item.view}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            {appView === "api-explorer" && isMobile && <RoutesSidebar
              embed
              routes={routes}
              selectedRoute={selectedRoute}
              onSelectRoute={onSelectRoute}
              onRefresh={onRefresh}
              apiBase={apiBase}
            />}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Second sidebar: list (API Routes only; hidden when Logs is active) */}
      {appView !== "logs" && (
        <Sidebar
          collapsible="none"
          className="hidden min-w-0 flex-1 md:flex flex-col"
        >
          <RoutesSidebar
            embed
            routes={routes}
            selectedRoute={selectedRoute}
            onSelectRoute={onSelectRoute}
            onRefresh={onRefresh}
            apiBase={apiBase}
          />
        </Sidebar>
      )}
    </Sidebar>
  );
}
