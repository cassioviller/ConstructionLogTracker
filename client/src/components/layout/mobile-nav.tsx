import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Building2, Home, FileBarChart, ImageIcon } from "lucide-react";

export default function MobileNav() {
  const [location, navigate] = useLocation();

  const isActivePath = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 shadow-lg">
      <div className="grid grid-cols-4 h-16">
        <button
          onClick={() => navigate("/")}
          className={cn(
            "flex flex-col items-center justify-center",
            isActivePath("/") && !location.includes("project")
              ? "text-primary"
              : "text-slate-500"
          )}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </button>
        
        <button
          onClick={() => navigate("/projects")}
          className={cn(
            "flex flex-col items-center justify-center",
            isActivePath("/project") ? "text-primary" : "text-slate-500"
          )}
        >
          <Building2 className="h-6 w-6" />
          <span className="text-xs mt-1">Projetos</span>
        </button>
        

        
        <button
          onClick={() => navigate("/photos")}
          className={cn(
            "flex flex-col items-center justify-center",
            isActivePath("/photos") ? "text-primary" : "text-slate-500"
          )}
        >
          <ImageIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Galeria</span>
        </button>
      </div>
    </nav>
  );
}
