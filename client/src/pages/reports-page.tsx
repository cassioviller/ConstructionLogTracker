import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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

export default function ReportsPage() {
  const [_, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Fetch RDO list from all projects with pagination
  const { data: rdoResponse, isLoading: isRdoLoading } = useQuery({
    queryKey: ["/api/reports", page, searchTerm, monthFilter],
    queryFn: async ({ queryKey }) => {
      const [_, page, search, month] = queryKey;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      
      if (search) params.append("search", search.toString());
      if (month && month !== "all") params.append("month", month.toString());
      
      const res = await fetch(`/api/reports?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
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

  if (isRdoLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const totalPages = rdoResponse?.totalPages || 1;
  const rdos = rdoResponse?.items || [];

  return (
    <MainLayout>
      <div className="flex items-center mb-6">
        <Button onClick={() => navigate("/")} variant="ghost" className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Todos os Relatórios Diários de Obra</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-8">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar nos relatórios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={monthFilter}
                onValueChange={setMonthFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por mês" />
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
        </div>

        {rdos.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-1">Nenhum relatório encontrado</h3>
            <p className="text-slate-500 mb-4">Não há relatórios que correspondam aos critérios de busca.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">RDO #</th>
                  <th className="px-4 py-3 text-left">Projeto</th>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Responsável</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rdos.map((report: any) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      #{report.number}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {report.projectName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(report.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {report.createdByName || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : report.status === 'draft' 
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {report.status === 'completed' ? 'Concluído' : 
                         report.status === 'draft' ? 'Rascunho' : 'Em andamento'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="link" 
                          className="text-primary"
                          onClick={() => navigate(`/project/${report.projectId}/rdo/${report.id}`)}
                        >
                          Visualizar
                        </Button>
                        <Button 
                          variant="link" 
                          className="text-slate-500"
                          onClick={() => window.open(`/api/rdos/${report.id}/pdf`, '_blank')}
                        >
                          PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(page > 1 ? page - 1 : 1)}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Show only current page, first, last, and 1 page before and after current
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPage(pageNum)}
                          isActive={pageNum === page}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  // Show ellipsis for gaps
                  if (
                    (pageNum === 2 && page > 3) || 
                    (pageNum === totalPages - 1 && page < totalPages - 2)
                  ) {
                    return (
                      <PaginationItem key={`ellipsis-${pageNum}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  
                  return null;
                })}
                
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
      </div>
    </MainLayout>
  );
}