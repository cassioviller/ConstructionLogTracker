import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";

interface ProjectProps {
  project: {
    id: string | number;
    name: string;
    client: string;
    location: string;
    status?: string;
    progress?: number;
    startDate?: string;
    expectedEndDate?: string;
    description?: string;
  };
}

const ProjectCard = ({ project }: ProjectProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Em andamento</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Concluído</Badge>;
      case "on_hold":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Paralisado</Badge>;
      case "planning":
        return <Badge variant="outline" className="bg-slate-100 text-slate-800">Planejamento</Badge>;
      default:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Em andamento</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-40 bg-slate-200 relative">
        {/* We'll use a placeholder for the project image */}
        <div className="h-full w-full flex items-center justify-center bg-blue-100">
          <Building className="h-16 w-16 text-primary opacity-30" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          {getStatusBadge(project.status)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-800">{project.name}</h3>
        <p className="text-slate-500 text-sm mb-3">
          {project.client} • {project.location}
        </p>
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <div>
            <span className="font-medium">Início:</span> {formatDate(project.startDate)}
          </div>
          <div>
            <span className="font-medium">Previsão:</span> {formatDate(project.expectedEndDate)}
          </div>
        </div>
        {project.progress !== undefined && (
          <div className="mb-4">
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            <p className="text-right text-xs text-slate-500 mt-1">{project.progress}% completo</p>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            {/* Placeholder for team members */}
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs">JS</div>
            <div className="h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">MB</div>
            <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">FL</div>
          </div>
          <Link href={`/projects/${project.id}`}>
            <Button variant="link" className="text-primary hover:text-primary/80 font-medium">
              Ver detalhes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
