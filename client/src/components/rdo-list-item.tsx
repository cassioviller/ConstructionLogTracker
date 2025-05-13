import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Pencil } from "lucide-react";

interface RDOProps {
  rdo: {
    id: string | number;
    reportNumber: number;
    date: string;
    createdBy?: number;
    createdByName?: string;
    weatherMorning: string;
    weatherAfternoon: string;
    weatherNight: string;
    status: string;
    workforceCount?: number;
    occurrenceCount?: number;
  };
}

const RDOListItem = ({ rdo }: RDOProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "ensolarado":
        return (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Ensolarado</span>
          </div>
        );
      case "nublado":
        return (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <span>Nublado</span>
          </div>
        );
      case "chuvoso":
        return (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span>Chuvoso</span>
          </div>
        );
      case "ventoso":
        return (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            <span>Ventoso</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <span>N/A</span>
          </div>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completo</Badge>;
      case "draft":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Rascunho</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-100 text-slate-800">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b last:border-0 hover:bg-slate-50">
      <div className="mb-2 sm:mb-0">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-primary mr-2" />
          <span className="font-medium text-slate-900">
            RDO #{rdo.reportNumber} - {formatDate(rdo.date)}
          </span>
        </div>
        <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500">
          <span>Por: {rdo.createdByName || "Usuário"}</span>
          <div className="hidden sm:block h-1 w-1 rounded-full bg-slate-300"></div>
          <span>Clima: {getWeatherIcon(rdo.weatherMorning)}</span>
          <div className="hidden sm:block h-1 w-1 rounded-full bg-slate-300"></div>
          <span>Equipe: {rdo.workforceCount || 0} pessoas</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        {getStatusBadge(rdo.status)}
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Visualizar</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button variant="ghost" size="sm">
            <FileText className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RDOListItem;
