import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavigationSidebar from "@/components/navigation-sidebar";
import MobileFooterNav from "@/components/mobile-footer-nav";
import { Building, FileText, Image, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data for the dashboard (in a real app, this would be fetched from the server)
  const { data: projects } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      return [];
    },
  });
  
  const { data: rdos } = useQuery<any[]>({
    queryKey: ["/api/rdos/recent"],
    queryFn: async () => {
      return [];
    },
  });
  
  const { data: photos } = useQuery<any[]>({
    queryKey: ["/api/photos/recent"],
    queryFn: async () => {
      return [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg text-primary">Meu Diário de Obra Pro</span>
        </div>
      </header>

      <div className="flex flex-1">
        <NavigationSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto pb-16 lg:pb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
              <p className="text-slate-500">Bem-vindo(a) ao seu painel de controle, {user?.name}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/projects">
                <Button>
                  <Building className="h-4 w-4 mr-2" />
                  Ver Projetos
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-slate-500 text-sm">Total de Projetos</h2>
                  <span className="p-2 bg-blue-100 rounded-md">
                    <Building className="h-5 w-5 text-primary" />
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-slate-800">{projects?.length || 0}</span>
                  <span className="text-sm text-green-500 ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    Novo este mês
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-slate-500 text-sm">RDOs Criados</h2>
                  <span className="p-2 bg-green-100 rounded-md">
                    <FileText className="h-5 w-5 text-green-500" />
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-slate-800">{rdos?.length || 0}</span>
                  <span className="text-sm text-green-500 ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    Esta semana
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-slate-500 text-sm">Fotos Registradas</h2>
                  <span className="p-2 bg-amber-100 rounded-md">
                    <Image className="h-5 w-5 text-amber-500" />
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-slate-800">{photos?.length || 0}</span>
                  <span className="text-sm text-green-500 ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    Esta semana
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex justify-between items-center pb-2">
                  <CardTitle>Últimos Relatórios</CardTitle>
                  <Link href="/projects" className="text-primary hover:text-primary/80 text-sm font-medium">
                    Ver todos
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    {rdos?.length ? (
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">RDO</th>
                            <th className="py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Projeto</th>
                            <th className="py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
                            <th className="py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(rdos as [])?.map((_, index) => (
                            <tr key={index} className="hover:bg-slate-50">
                              <td className="py-3 text-sm font-medium text-slate-900">#042</td>
                              <td className="py-3 text-sm text-slate-500">Edifício Antares</td>
                              <td className="py-3 text-sm text-slate-500">07/11/2023</td>
                              <td className="py-3 text-sm text-slate-500">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completo</span>
                              </td>
                              <td className="py-3 text-sm text-right">
                                <Link href="/projects/1" className="text-primary hover:text-primary/80">Visualizar</Link>
                              </td>
                            </tr>
                          ))}
                          {!rdos?.length && (
                            <tr>
                              <td colSpan={5} className="py-4 text-center text-sm text-slate-500">
                                Nenhum relatório encontrado
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <div className="py-4 text-center text-sm text-slate-500">
                        Nenhum relatório encontrado. Comece criando um projeto e adicionando RDOs.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader className="flex justify-between items-center pb-2">
                  <CardTitle>Registros Recentes</CardTitle>
                  <Link href="/projects" className="text-primary hover:text-primary/80 text-sm font-medium">
                    Ver todos
                  </Link>
                </CardHeader>
                <CardContent>
                  {(photos?.length || projects?.length) ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {Array(4).fill(0).map((_, index) => (
                          <div key={index} className="h-24 w-full bg-slate-200 rounded-md flex items-center justify-center text-slate-400">
                            <Image className="h-6 w-6" />
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-slate-200 pt-4">
                        <h3 className="text-sm font-medium text-slate-700 mb-2">Atividades Recentes</h3>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-slate-700">RDO criado</p>
                              <p className="text-xs text-slate-500">Hoje às 17:45</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                              <Image className="h-4 w-4" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-slate-700">Novas fotos adicionadas</p>
                              <p className="text-xs text-slate-500">Hoje às 16:30</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                              <Users className="h-4 w-4" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-slate-700">Membros adicionados</p>
                              <p className="text-xs text-slate-500">Ontem às 11:15</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-slate-500">
                      <Image className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                      Nenhum registro encontrado. Adicione fotos aos seus projetos.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      <MobileFooterNav />
    </div>
  );
}
