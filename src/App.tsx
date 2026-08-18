import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Opponents from "./pages/Opponents";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-12 flex items-center border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                <SidebarTrigger className="ml-4" />
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-muted-foreground">Football Lineup Optimizer</h2>
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/opponents" element={<Opponents />} />
                   <Route path="/optimize" element={<Index />} />
                  <Route path="*" element={<Dashboard/>} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
