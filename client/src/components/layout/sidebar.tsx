import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Building2, FileText, Home, Image, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/projects", label: "Projetos", icon: Building2 },
    { href: "/projects", label: "Relatórios", icon: FileText, subPath: "rdos" },
    { href: "/projects", label: "Galeria", icon: Image, subPath: "photos" }
  ];

  // Check if current location is a project route
  const isProject = location.startsWith("/projects/") && location.split("/").length > 2;
  // Get project ID from URL if on a project page
  const projectId = isProject ? location.split("/")[2].split("?")[0] : null;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 lg:static lg:translate-x-0 transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <Link href="/">
                <a className="flex items-center space-x-2">
                  <span className="bg-primary text-white p-1 rounded">
                    <Building2 className="h-6 w-6" />
                  </span>
                  <span className="font-bold text-lg text-slate-800">Meu Diário de Obra</span>
                </a>
              </Link>
              <button 
                className="lg:hidden text-slate-500 hover:text-slate-900"
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="p-4">
              <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Menu Principal
              </p>
              <ul className="space-y-1">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>
                      <a className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        location === link.href 
                          ? "bg-primary text-white" 
                          : "text-slate-700 hover:bg-slate-100"
                      )}>
                        <link.icon className="h-5 w-5" />
                        <span>{link.label}</span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>

              {projects && projects.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Meus Projetos
                  </p>
                  <ul className="space-y-1">
                    {projects.map((project) => (
                      <li key={project.id}>
                        <Link href={`/projects/${project.id}`}>
                          <a className={cn(
                            "flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors",
                            projectId === project.id.toString()
                              ? "bg-slate-100 font-medium"
                              : "text-slate-700 hover:bg-slate-50"
                          )}>
                            <span className={cn(
                              "h-2 w-2 rounded-full",
                              project.status === "active" ? "bg-green-500" :
                              project.status === "paused" ? "bg-amber-500" : 
                              "bg-slate-400"
                            )} />
                            <span className="truncate">{project.name}</span>
                          </a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-200">
            {user && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                    </span>
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.role}</p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  title="Sair"
                >
                  <LogOut className="h-5 w-5 text-slate-500" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
