import { useLocation, Link } from "wouter";
import { 
  HomeIcon, 
  Building, 
  FileText, 
  Image 
} from "lucide-react";

const MobileFooterNav = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path || (path !== '/' && location.startsWith(path));
  };

  const navItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: <HomeIcon className="h-6 w-6" />,
    },
    {
      path: "/projects",
      label: "Projetos",
      icon: <Building className="h-6 w-6" />,
    },
    {
      path: "/reports",
      label: "Relatórios",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      path: "/photos",
      label: "Galeria",
      icon: <Image className="h-6 w-6" />,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-10 shadow-lg">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a 
              className={`flex flex-col items-center justify-center ${
                isActive(item.path) ? "text-primary" : "text-slate-500"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileFooterNav;
