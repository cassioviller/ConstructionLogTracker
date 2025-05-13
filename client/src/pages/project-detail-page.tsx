import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileEdit, ChevronLeft } from "lucide-react";
import NavigationSidebar from "@/components/navigation-sidebar";
import MobileFooterNav from "@/components/mobile-footer-nav";
import RDOListItem from "@/components/rdo-list-item";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Query to get project details
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: [`/api/projects/${id}`],
    queryFn: async () => {
      return {
        id,
        name: "Edifício Corporativo Central",
        client: "Empresa ABC Ltda.",
        location: "São Paulo, SP",
        startDate: "2023-03-15",
        expectedEndDate: "2024-10-20",
        status: "active",
        progress: 65,
        description: "Construção de edifício comercial com 20 andares e 3 subsolos.",
      };
    },
  });
  
  // Query to get project RDOs
  const { data: rdos, isLoading: isLoadingRDOs } = useQuery({
    queryKey: [`/api/projects/${id}/rdos`],
    queryFn: async () => {
      return [];
    },
  });
  
  // Query to get project photos
  const { data: photos, isLoading: isLoadingPhotos } = useQuery({
    queryKey: [`/api/projects/${id}/photos`],
    queryFn: async () => {
      return [];
    },
  });
  
  // Query to get project members
  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: [`/api/projects/${id}/members`],
    queryFn: async () => {
      return [];
    },
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "on_hold":
        return "bg-amber-100 text-amber-800";
      case "planning":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Em andamento";
      case "completed":
        return "Concluído";
      case "on_hold":
        return "Paralisado";
      case "planning":
        return "Planejamento";
      default:
        return status;
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{project?.name}</h1>
              <p className="text-slate-500">{project?.client} • {project?.location}</p>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Informações do Projeto</CardTitle>
              <Button variant="outline" size="sm">
                <FileEdit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Responsável Técnico</h3>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-2">
                      {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "JS"}
                    </div>
                    <span className="text-slate-800">{user?.name || "João Silva"}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Data de Início</h3>
                  <p className="text-slate-800">{formatDate(project?.startDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Previsão de Término</h3>
                  <p className="text-slate-800">{formatDate(project?.expectedEndDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Cliente</h3>
                  <p className="text-slate-800">{project?.client}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Endereço</h3>
                  <p className="text-slate-800">{project?.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Status</h3>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusBadgeColor(project?.status)}`}
                  >
                    {getStatusText(project?.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-700">Progresso</h3>
                  <span className="text-sm font-medium text-slate-700">{project?.progress}%</span>
                </div>
                <Progress value={project?.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full border-b border-slate-200 bg-transparent px-0">
              <TabsTrigger value="overview" className="data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="rdos" className="data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4">
                Relatórios (RDOs)
              </TabsTrigger>
              <TabsTrigger value="photos" className="data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4">
                Galeria de Fotos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="pt-2 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base">Descrição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      {project?.description || "Nenhuma descrição fornecida."}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base">Equipe</CardTitle>
                    <Button variant="ghost" size="sm">
                      Gerenciar
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMembers ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {members && members.length > 0 ? (
                          members.map((member: any) => (
                            <div key={member.id} className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm mr-3">
                                {member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-slate-800">{member.name}</h3>
                                <p className="text-xs text-slate-500">{member.role}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-sm text-slate-500">
                            Nenhum membro na equipe
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="rdos" className="pt-2 mt-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-slate-800">Relatórios Diários de Obra</h2>
                <Link href={`/projects/${id}/new-rdo`}>
                  <Button>
                    Novo RDO
                  </Button>
                </Link>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  {isLoadingRDOs ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : rdos && rdos.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                      {rdos.map((rdo: any) => (
                        <RDOListItem key={rdo.id} rdo={rdo} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum RDO encontrado</h3>
                      <p className="text-slate-500 mb-4 max-w-md mx-auto">
                        Comece a documentar o progresso da sua obra criando um relatório diário.
                      </p>
                      <Link href={`/projects/${id}/new-rdo`}>
                        <Button>
                          Criar Primeiro RDO
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="photos" className="pt-2 mt-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-slate-800">Galeria de Fotos</h2>
                <Link href={`/projects/${id}/new-rdo`}>
                  <Button variant="outline">
                    Adicionar Fotos
                  </Button>
                </Link>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  {isLoadingPhotos ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : photos && photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {photos.map((photo: any) => (
                        <div key={photo.id} className="relative group rounded-md overflow-hidden">
                          <div className="aspect-square bg-slate-200 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button size="sm" variant="secondary">
                              Visualizar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhuma foto encontrada</h3>
                      <p className="text-slate-500 mb-4 max-w-md mx-auto">
                        Adicione fotos ao criar um novo RDO para documentar o progresso da sua obra.
                      </p>
                      <Link href={`/projects/${id}/new-rdo`}>
                        <Button>
                          Criar RDO com Fotos
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <MobileFooterNav />
    </div>
  );
}
