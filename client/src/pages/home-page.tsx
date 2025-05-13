import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Project, Rdo } from "@shared/schema";
import { Loader2, Building2, FileText, Image, AlertTriangle, CloudRain, Cloud, Sun } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch recent reports
  const { data: recentReports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["/api/recent-reports"],
  });

  // Fetch stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Get recent projects (top 3)
  const recentProjects = projects
    ? [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3)
    : [];

  return (
    <Layout>
      <Helmet>
        <title>Dashboard | Meu Diário de Obra Pro</title>
        <meta name="description" content="Painel de controle do sistema Meu Diário de Obra Pro - gerencie seus projetos e relatórios diários de obra." />
      </Helmet>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Bem-vindo(a), {user?.name || "Usuário"}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/projects">
            <a className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors">
              <Building2 className="h-5 w-5 mr-2" />
              Ver Projetos
            </a>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total de Projetos</p>
                <h3 className="text-3xl font-bold mt-2">
                  {isLoadingProjects ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    projects?.length || 0
                  )}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Relatórios (RDOs)</p>
                <h3 className="text-3xl font-bold mt-2">
                  {isLoadingProjects ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    "42"
                  )}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Fotos Registradas</p>
                <h3 className="text-3xl font-bold mt-2">
                  {isLoadingProjects ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    "156"
                  )}
                </h3>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Image className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Últimos Projetos</CardTitle>
                <Link href="/projects">
                  <a className="text-primary hover:text-blue-700 text-sm font-medium">Ver todos</a>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingProjects ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-800">{project.name}</h3>
                        <p className="text-sm text-slate-500">{project.client} • {project.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-500">
                          Progresso: <span className="font-medium text-slate-700">{project.progress}%</span>
                        </div>
                        <Link href={`/projects/${project.id}`}>
                          <a className="text-sm text-primary hover:text-blue-700">Detalhes →</a>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-slate-500">Nenhum projeto encontrado</p>
                  <Link href="/projects">
                    <a className="mt-2 inline-block text-primary hover:text-blue-700">Criar um novo projeto</a>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Relatórios Recentes</CardTitle>
                <Link href="/reports">
                  <a className="text-primary hover:text-blue-700 text-sm font-medium">Ver todos</a>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingReports ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recentReports && recentReports.length > 0 ? (
                <div className="space-y-3">
                  {recentReports.map((report: any) => (
                    <div key={report.id} className="flex items-start p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                      <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <Link href={`/rdo/${report.id}`}>
                          <a className="font-medium text-slate-800 hover:text-primary">
                            RDO #{report.number} - {report.projectName}
                          </a>
                        </Link>
                        <div className="flex items-center mt-1">
                          <div className="flex space-x-1 mr-3">
                            {report.weatherMorning === 'sunny' && <Sun className="h-4 w-4 text-amber-500" />}
                            {report.weatherMorning === 'cloudy' && <Cloud className="h-4 w-4 text-slate-500" />}
                            {report.weatherMorning === 'rainy' && <CloudRain className="h-4 w-4 text-blue-500" />}
                            
                            {report.weatherAfternoon === 'sunny' && <Sun className="h-4 w-4 text-amber-500" />}
                            {report.weatherAfternoon === 'cloudy' && <Cloud className="h-4 w-4 text-slate-500" />}
                            {report.weatherAfternoon === 'rainy' && <CloudRain className="h-4 w-4 text-blue-500" />}
                          </div>
                          <p className="text-xs text-slate-500">
                            {report.date ? format(new Date(report.date), "dd 'de' MMMM", { locale: ptBR }) : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium" 
                        style={{ 
                          backgroundColor: report.status === 'completed' ? '#e6f4ea' : '#fff3e0',
                          color: report.status === 'completed' ? '#137333' : '#b06000'
                        }}>
                        {report.status === 'completed' ? 'Concluído' : 'Em andamento'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <FileText className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">Nenhum relatório encontrado</p>
                  <Link href="/new-rdo">
                    <a className="mt-2 inline-block text-primary hover:text-blue-700">Criar um novo RDO</a>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
