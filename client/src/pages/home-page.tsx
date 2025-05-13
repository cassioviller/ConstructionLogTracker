import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/layout/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Project } from "@shared/schema";
import { Loader2, Building2, FileText, Image } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
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
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-primary mr-3">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">RDO #042 foi criado</p>
                    <p className="text-xs text-slate-500">Hoje às 17:45</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                    <Image className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">4 novas fotos adicionadas</p>
                    <p className="text-xs text-slate-500">Hoje às 16:30</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">Ocorrência registrada: Falta de material</p>
                    <p className="text-xs text-slate-500">Hoje às 11:15</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
