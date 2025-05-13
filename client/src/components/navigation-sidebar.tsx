import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  HomeIcon, 
  Building, 
  FileText, 
  Image, 
  Users, 
  Settings,
  LogOut,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavigationSidebar = ({ isOpen, setIsOpen }: NavigationSidebarProps) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => {
    return location === path || (path !== '/' && location.startsWith(path));
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const menuItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      path: "/projects",
      label: "Projetos",
      icon: <Building className="h-5 w-5" />,
    },
    {
      path: "/reports",
      label: "Relatórios",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      path: "/photos",
      label: "Galeria",
      icon: <Image className="h-5 w-5" />,
    },
  ];

  // Mock projects for the menu
  const userProjects = [
    { id: 1, name: "Edifício Antares", status: "active" },
    { id: 2, name: "Residencial Alameda", status: "on_hold" },
    { id: 3, name: "Shopping Center Novo", status: "planning" },
  ];

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "on_hold":
        return "bg-amber-500";
      case "planning":
        return "bg-blue-500";
      default:
        return "bg-slate-500";
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="flex items-center space-x-2 cursor-pointer">
                <span className="bg-primary text-white p-1 rounded">
                  <Building className="h-6 w-6" />
                </span>
                <span className="font-bold text-lg text-primary">Meu Diário de Obra Pro</span>
              </span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <nav className="p-2 flex-1 overflow-y-auto">
          <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu Principal
          </p>
          
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsOpen(false)}
            >
              <a
                className={`flex items-center space-x-2 px-3 py-2 rounded-md my-1 transition-colors ${
                  isActive(item.path)
                    ? "bg-primary text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
          
          <p className="px-3 py-2 mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Meus Projetos
          </p>
          
          {userProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              onClick={() => setIsOpen(false)}
            >
              <a
                className={`flex items-center space-x-2 px-3 py-2 rounded-md my-1 text-slate-500 hover:bg-slate-100 transition-colors ${
                  isActive(`/projects/${project.id}`) ? "bg-slate-100" : ""
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${getStatusColorClass(project.status)}`}></span>
                <span>{project.name}</span>
              </a>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.name ? getUserInitials(user.name) : "U"}
              </span>
            </div>
            <div>
              <div className="font-medium">{user?.name || "Usuário"}</div>
              <div className="text-sm text-slate-500">{user?.role || "Usuário"}</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 justify-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Perfil
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 justify-center"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default NavigationSidebar;
