import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ProjectsPage from "@/pages/projects-page";
import ProjectDetailPage from "@/pages/project-detail-page";
import NewRdoPage from "@/pages/new-rdo-page";
import EditRdoPage from "@/pages/edit-rdo-page";
import RdoHistoryPage from "@/pages/rdo-history-page";
import RdoDetailPage from "@/pages/rdo-detail-page";
import PhotosPage from "@/pages/photos-page";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "@/components/ui/theme-provider";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/projects" component={ProjectsPage} />
      <ProtectedRoute path="/project/:id" component={ProjectDetailPage} />
      <ProtectedRoute path="/project/:id/new-rdo" component={NewRdoPage} />
      <ProtectedRoute path="/project/:id/rdo-history" component={RdoHistoryPage} />
      <ProtectedRoute path="/project/:id/rdo/:rdoId/edit" component={EditRdoPage} />
      <ProtectedRoute path="/project/:id/rdo/:rdoId" component={RdoDetailPage} />
      <ProtectedRoute path="/photos" component={PhotosPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="diario-obra-theme">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
