import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, FileBarChart, ImageIcon, PencilIcon, PlusIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectDetailPage() {
  const { id } = useParams();

  const { data: project, isLoading } = useQuery({
    queryKey: [`/api/projects/${id}`],
  });

  const { data: recentReports, isLoading: isReportsLoading } = useQuery({
    queryKey: [`/api/projects/${id}/reports`],
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h3 className="text-lg font-medium text-slate-600 mb-2">Projeto não encontrado</h3>
          <p className="text-slate-500 mb-4">O projeto que você procura não existe ou foi removido</p>
          <Link href="/projects">
            <Button>Voltar para Projetos</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center mb-6">
        <Link href="/projects" className="inline-flex items-center text-slate-500 hover:text-primary transition-colors mr-3">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
          <p className="text-slate-500">{project.client} • {project.location}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <CardTitle className="text-lg">Informações do Projeto</CardTitle>
          <Button variant="outline" size="sm" className="flex items-center">
            <PencilIcon className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Responsável Técnico</h3>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-2">
                  {project.responsible?.name?.charAt(0) || "U"}
                </div>
                <span className="text-slate-800">{project.responsible?.name || "Não atribuído"}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Data de Início</h3>
              <p className="text-slate-800">{new Date(project.startDate).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Previsão de Término</h3>
              <p className="text-slate-800">{new Date(project.endDate).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Cliente</h3>
              <p className="text-slate-800">{project.client}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Endereço</h3>
              <p className="text-slate-800">{project.location}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Status</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Em andamento</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Relatórios (RDOs)</h2>
              <Link href={`/project/${id}/new-rdo`}>
                <Button variant="link" className="text-primary hover:text-blue-700 text-sm font-medium p-0">
                  Novo RDO
                </Button>
              </Link>
            </div>
            <div className="text-center py-6">
              <span className="text-4xl font-bold text-slate-800">{project.reportCount || 0}</span>
              <p className="text-slate-500">RDOs criados</p>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <Link href={`/project/${id}/rdo-history`}>
                <Button variant="ghost" className="w-full justify-between">
                  <span>Ver todos os relatórios</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Galeria</h2>
              <Button variant="link" className="text-primary hover:text-blue-700 text-sm font-medium p-0">
                Ver todas
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <img
                src="https://images.unsplash.com/photo-1583806999637-30509e2df2b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200"
                alt="Fundação em progresso"
                className="rounded-md h-16 w-full object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200"
                alt="Soldagem da estrutura metálica"
                className="rounded-md h-16 w-full object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1578530332818-6ba472e67b9f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200"
                alt="Concretagem do segundo pavimento"
                className="rounded-md h-16 w-full object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200"
                alt="Vista geral da obra"
                className="rounded-md h-16 w-full object-cover"
              />
              <img
                src="https://pixabay.com/get/g659fc68ce6676cec6054a49737c2d5bf28b7594cc5a84fbdd3673de1d1b3e3b90b637dff941d0c95766e95ba9af380d97a93b70729b7c0aacb615a57e97cd6ae_1280.jpg"
                alt="Trabalho interno de estruturação"
                className="rounded-md h-16 w-full object-cover"
              />
              <div className="relative h-16 rounded-md bg-slate-100 flex items-center justify-center">
                <span className="text-slate-500 font-medium">+{project.photoCount || 0}</span>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4 mt-4">
              <Button variant="ghost" className="w-full justify-between">
                <span>Adicionar fotos</span>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Equipe</h2>
              <Button variant="link" className="text-primary hover:text-blue-700 text-sm font-medium p-0">
                Gerenciar
              </Button>
            </div>
            <div className="space-y-4">
              {project.team && project.team.length > 0 ? (
                project.team.map((member) => (
                  <div key={member.id} className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm mr-3">
                      {member.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-800">{member.name}</h3>
                      <p className="text-xs text-slate-500">{member.jobTitle}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">
                  Nenhum membro na equipe
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 pt-4 mt-4">
              <Button variant="ghost" className="w-full justify-between">
                <span>Adicionar membro</span>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Últimos Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          {isReportsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      RDO
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Clima
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Funcionários
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports && recentReports.length > 0 ? (
                    recentReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm font-medium text-slate-900">#{report.number}</td>
                        <td className="py-3 px-4 text-sm text-slate-500">
                          {new Date(report.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            {report.weatherMorning === 'sunny' && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-amber-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                              </svg>
                            )}
                            {report.weatherMorning === 'cloudy' && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                                />
                              </svg>
                            )}
                            {report.weatherMorning === 'rainy' && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                              </svg>
                            )}
                            <span>
                              {report.weatherMorning === 'sunny'
                                ? 'Ensolarado'
                                : report.weatherMorning === 'cloudy'
                                ? 'Nublado'
                                : report.weatherMorning === 'rainy'
                                ? 'Chuvoso'
                                : 'Variado'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500">{report.workforceCount}</td>
                        <td className="py-3 px-4 text-sm text-slate-500">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {report.status === 'completed' ? 'Completo' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="link" className="text-primary">
                              Visualizar
                            </Button>
                            <Button variant="link" className="text-slate-500">
                              PDF
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        Nenhum relatório encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="p-4 border-t border-slate-200 text-center">
            <Link href={`/project/${id}/rdo-history`}>
              <Button variant="link" className="text-primary hover:text-blue-700 font-medium">
                Ver todos os RDOs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
