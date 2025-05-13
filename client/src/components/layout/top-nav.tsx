import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Menu, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TopNavProps = {
  toggleSidebar: () => void;
};

export default function TopNav({ toggleSidebar }: TopNavProps) {
  const { user, logoutMutation } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <span className="font-bold text-xl text-slate-800 ml-2 lg:hidden">
                Meu Diário de Obra Pro
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2">
              <Bell className="h-5 w-5 text-slate-500" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.name || "Usuário"} />
                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Seu Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configurações</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
