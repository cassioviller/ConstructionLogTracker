import { Link, useLocation } from "wouter";
import { Building2, FileText, Home, Image } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/projects", label: "Projetos", icon: Building2 },
    { href: "/rdos", label: "Relatórios", icon: FileText },
    { href: "/photos", label: "Galeria", icon: Image },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-10">
      <div className="grid grid-cols-4 h-14">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex flex-col items-center justify-center text-xs",
                location === item.href
                  ? "text-primary"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
