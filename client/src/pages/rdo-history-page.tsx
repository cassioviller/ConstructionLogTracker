import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Loader2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function RdoHistoryPage() {
  const { id: projectId } = useParams();
  const [_, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch project info
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
  });

  // Fetch RDO list for this project with pagination
  // Função para recarregar a lista de RDOs
  const fetchReports = (currentPage: number) => {
    setPage(currentPage);
  };

  const { data: rdoResponse, isLoading: isRdoLoading, error: rdoError, refetch } = useQuery({
    queryKey: [`/api/projects/${projectId}/reports`, page, searchTerm, monthFilter],
    queryFn: async ({ queryKey }) => {
      const [baseUrl, page, search, month] = queryKey;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      
      if (search) params.append("search", search.toString());
      if (month && month !== "all") params.append("month", month.toString());
      
      console.log(`Buscando RDOs para projeto ${projectId} com parâmetros:`, params.toString());
      
      try {
        const url = `${baseUrl}?${params.toString()}`;
        console.log("URL de requisição completa:", url);
        
        const res = await fetch(url);
        if (!res.ok) {
          console.error(`Erro ao buscar RDOs: ${res.status} ${res.statusText}`);
          
          // Tenta ler o corpo da resposta para obter mais detalhes do erro
          try {
            const errorBody = await res.text();
            console.error("Detalhes do erro:", errorBody);
          } catch (e) {
            console.error("Não foi possível ler detalhes do erro");
          }
          
          throw new Error(`Failed to fetch reports: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Resposta completa da API:", JSON.stringify(data, null, 2));
        console.log(`RDOs recebidos: ${data.items?.length || 0} registros`);
        return data;
      } catch (error) {
        console.error("Erro ao buscar RDOs:", error);
        throw error;
      }
    },
  });

  const getMonthOptions = () => {
    const currentYear = new Date().getFullYear();
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1);
      months.push({
        value: `${i + 1}`,
        label: format(date, "MMMM/yyyy", { locale: ptBR }),
      });
    }
    
    return months;
  };

  if (isProjectLoading) {
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
          <Button onClick={() => navigate("/projects")}>Voltar para Projetos</Button>
        </div>
      </MainLayout>
    );
  }

  const totalPages = rdoResponse?.totalPages || 1;
  const rdos = rdoResponse?.items || [];

  return (
    <MainLayout>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/project/${projectId}`)}
          className="mr-3"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Histórico de Relatórios</h1>
          <p className="text-slate-500">{project.name}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-slate-900">Histórico de Relatórios</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar RDO..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os meses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {getMonthOptions().map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isRdoLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      RDO #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Responsável
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status Clima
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Efetivo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Ocorrências
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {rdos.length > 0 ? (
                    rdos.map((rdo) => (
                      <tr key={rdo.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          #{rdo.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {format(new Date(rdo.date), "dd/MM/yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {rdo.createdByName || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          <div className="flex items-center">
                            {rdo.weatherMorning === "sunny" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-amber-500 mr-1"
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
                            {rdo.weatherMorning === "cloudy" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-slate-400 mr-1"
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
                            {rdo.weatherMorning === "rainy" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-blue-500 mr-1"
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
                            <span>{rdo.weatherMorning === "sunny" ? "Favorável" : rdo.weatherMorning === "cloudy" ? "Nublado" : "Chuvoso"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {rdo.workforceCount || 0} pessoas
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {rdo.occurrenceCount || 0} {rdo.occurrenceCount === 1 ? "ocorrência" : "ocorrências"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" className="h-8" onClick={() => navigate(`/project/${projectId}/rdo/${rdo.id}`)}>
                              <FileText className="h-4 w-4 mr-1" />
                              Visualizar
                            </Button>
                            <Button variant="outline" size="sm" className="h-8" onClick={() => navigate(`/project/${projectId}/rdo/${rdo.id}/edit`)}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Editar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 hover:text-red-600 hover:border-red-600"
                              onClick={async () => {
                                if (confirm(`Tem certeza que deseja excluir o RDO #${rdo.number}?`)) {
                                  setIsLoading(true);
                                  try {
                                    const response = await fetch(`/api/rdos/${rdo.id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'Content-Type': 'application/json'
                                      }
                                    });
                                    
                                    if (!response.ok) {
                                      throw new Error('Erro ao excluir RDO');
                                    }
                                    
                                    toast({
                                      title: "RDO excluído",
                                      description: `RDO #${rdo.number} excluído com sucesso`
                                    });
                                    
                                    // Recarregar a lista de RDOs
                                    refetch();
                                  } catch (error) {
                                    console.error('Erro ao excluir RDO:', error);
                                    toast({
                                      title: "Erro",
                                      description: "Não foi possível excluir o RDO",
                                      variant: "destructive"
                                    });
                                  } finally {
                                    setIsLoading(false);
                                  }
                                }
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Excluir
                            </Button>
                            <Button variant="outline" size="sm" className="h-8">
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                        Nenhum relatório encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(page > 1 ? page - 1 : 1)}
                      className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setPage(pageNumber)}
                          isActive={page === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink onClick={() => setPage(totalPages)}>
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}
