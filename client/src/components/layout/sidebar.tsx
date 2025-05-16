import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Building2, Home, FileBarChart, ImageIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Determine active path for highlighting
  const isActivePath = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="font-bold text-lg text-primary">Meu Diário de Obra Pro</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        
        <nav className="p-2 flex-1 overflow-y-auto">
          <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu Principal
          </p>
          
          <div onClick={() => setSidebarOpen(false)}>
            <Link href="/">
              <div
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md my-1 transition-colors cursor-pointer",
                  isActivePath("/")
                    ? "bg-primary text-white"
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </div>
            </Link>
          </div>
          
          <div onClick={() => setSidebarOpen(false)}>
            <Link href="/projects">
              <div
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md my-1 transition-colors cursor-pointer",
                  isActivePath("/project")
                    ? "bg-primary text-white"
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <Building2 className="h-5 w-5" />
                <span>Projetos</span>
              </div>
            </Link>
          </div>
          

          
          <div onClick={() => setSidebarOpen(false)}>
            <Link href="/photos">
              <div
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md my-1 transition-colors cursor-pointer",
                  isActivePath("/photos")
                    ? "bg-primary text-white"
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <ImageIcon className="h-5 w-5" />
                <span>Galeria</span>
              </div>
            </Link>
          </div>

          {projects && projects.length > 0 && (
            <>
              <p className="px-3 py-2 mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Meus Projetos
              </p>
              
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} onClick={() => setSidebarOpen(false)}>
                  <Link href={`/project/${project.id}`} key={project.id}>
                    <div
                      className="flex items-center space-x-2 px-3 py-2 rounded-md my-1 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        project.status === "inProgress" 
                          ? "bg-green-500" 
                          : project.status === "planning" 
                          ? "bg-blue-500" 
                          : project.status === "onHold" 
                          ? "bg-amber-500" 
                          : project.status === "completed" 
                          ? "bg-slate-500" 
                          : "bg-blue-500"
                      )}></span>
                      <span className="truncate">{project.name}</span>
                    </div>
                  </Link>
                </div>
              ))}
              
              {projects.length > 5 && (
                <div onClick={() => setSidebarOpen(false)}>
                  <Link href="/projects">
                    <div className="flex justify-center text-xs text-primary hover:text-blue-700 px-3 py-2 cursor-pointer">
                      Ver todos ({projects.length})
                    </div>
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                <span className="text-sm font-medium">{user?.name?.charAt(0) || "U"}</span>
              </div>
              <div>
                <div className="font-medium text-sm">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.jobTitle}</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => logoutMutation.mutate()}
              title="Sair"
            >
              <LogOut className="h-5 w-5 text-slate-500" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
