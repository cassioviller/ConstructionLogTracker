import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar, FileBarChart, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/stats"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: recentReports, isLoading: isReportsLoading } = useQuery({
    queryKey: ["/api/recent-reports"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Bem-vindo(a) ao seu painel de controle, {user?.name}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/projects">
            <Button className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Projetos
            </Button>
          </Link>
        </div>
      </div>

      {isStatsLoading ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Total de Projetos</p>
                <div className="p-2 bg-blue-100 rounded-md">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-800">{stats?.projects || 0}</span>
                <span className="text-sm text-green-500 ml-2 inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  +{stats?.newProjects || 0} novo este mês
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Relatórios Criados</p>
                <div className="p-2 bg-green-100 rounded-md">
                  <FileBarChart className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-800">{stats?.reports || 0}</span>
                <span className="text-sm text-green-500 ml-2 inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  +{stats?.newReports || 0} esta semana
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Fotos Registradas</p>
                <div className="p-2 bg-amber-100 rounded-md">
                  <ImageIcon className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-800">{stats?.photos || 0}</span>
                <span className="text-sm text-green-500 ml-2 inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  +{stats?.newPhotos || 0} esta semana
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Últimos Relatórios</CardTitle>
              <Link href="/reports">
                <Button variant="link" className="text-primary hover:text-blue-700 text-sm font-medium">
                  Ver todos
                </Button>
              </Link>
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
                        <th className="py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          RDO
                        </th>
                        <th className="py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Projeto
                        </th>
                        <th className="py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReports?.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50">
                          <td className="py-3 text-sm font-medium text-slate-900">#{report.number}</td>
                          <td className="py-3 text-sm text-slate-500">{report.projectName}</td>
                          <td className="py-3 text-sm text-slate-500">
                            {new Date(report.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 text-sm text-slate-500">
                            {report.status === 'completed' ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Completo
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                                Pendente
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-sm text-right">
                            <Link href={`/project/${report.projectId}/rdo/${report.id}`}>
                              <Button variant="link" className="text-primary hover:text-blue-700">
                                Visualizar
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {(!recentReports || recentReports.length === 0) && (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-500">
                            Nenhum relatório encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Registros Recentes</CardTitle>
              <Link href="/photos">
                <Button variant="link" className="text-primary hover:text-blue-700 text-sm font-medium">
                  Ver todos
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <img
                    src="https://pixabay.com/get/g3dce628665ba5b3b658bad44a541a365f8064533738d18048605325e27f6d1c1f73ca406c58f7f9dffbccce4e132f0e2944a2d7fd2da50f38aa69880ef0c33f7_1280.jpg"
                    alt="Fundação em progresso"
                    className="rounded-md h-24 w-full object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                    alt="Soldagem da estrutura metálica"
                    className="rounded-md h-24 w-full object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1578530332818-6ba472e67b9f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                    alt="Concretagem do segundo pavimento"
                    className="rounded-md h-24 w-full object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                    alt="Vista geral da obra com gruas"
                    className="rounded-md h-24 w-full object-cover"
                  />
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Atividades Recentes</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                        <FileBarChart className="h-4 w-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-slate-700">RDO #042 foi criado</p>
                        <p className="text-xs text-slate-500">Hoje às 17:45</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-slate-700">4 novas fotos adicionadas</p>
                        <p className="text-xs text-slate-500">Hoje às 16:30</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-slate-700">Falta de material registrada</p>
                        <p className="text-xs text-slate-500">Hoje às 11:15</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
