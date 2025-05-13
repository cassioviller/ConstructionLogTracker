import { useState } from "react";
import { Menu, Bell, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type NavbarProps = {
  setSidebarOpen: (open: boolean) => void;
};

export function Navbar({ setSidebarOpen }: NavbarProps) {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-slate-500 hover:text-slate-700"
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex-1 flex items-center justify-end">
            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-slate-500" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-medium">Notificações</h3>
                  </div>
                  <div className="py-2 max-h-72 overflow-y-auto">
                    <div className="px-4 py-2 text-sm text-slate-500">
                      Nenhuma notificação no momento.
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-slate-700">
                      <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US'}
                        </span>
                      </div>
                      <span className="hidden md:block text-sm font-medium">{user?.nome?.split(' ')[0] || 'Usuário'}</span>
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-4 py-3 text-sm text-center border-b border-slate-200">
                      <p className="font-medium text-slate-800">{user?.nome || 'Usuário'}</p>
                      <p className="text-slate-500">{user?.email || 'usuario@exemplo.com'}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate("/perfil")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Meu Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/configuracoes")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
