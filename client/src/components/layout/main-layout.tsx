import { useState, ReactNode } from "react";
import Sidebar from "./sidebar";
import TopNav from "./top-nav";
import MobileNav from "./mobile-nav";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <TopNav toggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
