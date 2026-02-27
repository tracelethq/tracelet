import { DocsLayout } from "@/pages";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "./components/ui/tooltip";

export function App() {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <DocsLayout />
      </TooltipProvider>
    </SidebarProvider>
  );
}

export default App;
