import { RoutesPage } from "@/components/routes-page";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "./components/ui/tooltip";

export function App() {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <RoutesPage />
      </TooltipProvider>
    </SidebarProvider>
  );
}

export default App;
