import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Project } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors: Record<string, string> = {
    inProgress: "bg-green-500 text-white",
    planning: "bg-blue-500 text-white",
    onHold: "bg-amber-500 text-white",
    completed: "bg-slate-500 text-white",
  };

  const statusText: Record<string, string> = {
    inProgress: "Em andamento",
    planning: "Planejamento",
    onHold: "Paralisado",
    completed: "Concluído",
  };

  const getProjectImage = (index: number) => {
    const defaultImages = [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542621334-a254cf47733d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://pixabay.com/get/g3dce628665ba5b3b658bad44a541a365f8064533738d18048605325e27f6d1c1f73ca406c58f7f9dffbccce4e132f0e2944a2d7fd2da50f38aa69880ef0c33f7_1280.jpg",
    ];
    
    return defaultImages[index % defaultImages.length];
  };

  // Format dates
  const startDate = format(new Date(project.startDate), "dd/MM/yyyy", { locale: ptBR });
  const endDate = format(new Date(project.endDate), "dd/MM/yyyy", { locale: ptBR });

  return (
    <Card className="overflow-hidden">
      <div className="h-40 bg-slate-200 relative">
        <img
          src={getProjectImage(project.id)}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[project.status] || "bg-slate-500 text-white"}`}>
            {statusText[project.status] || "Status desconhecido"}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-slate-800">{project.name}</h3>
        <p className="text-slate-500 text-sm mb-3">{project.client} • {project.location}</p>
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <div>
            <span className="font-medium">Início:</span> {startDate}
          </div>
          <div>
            <span className="font-medium">Previsão:</span> {endDate}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            {project.team && project.team.slice(0, 3).map((member, idx) => (
              <Avatar key={idx} className="border-2 border-white">
                <AvatarFallback className="bg-primary text-white">
                  {member.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.team && project.team.length > 3 && (
              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs border-2 border-white">
                +{project.team.length - 3}
              </div>
            )}
          </div>
          <Link href={`/project/${project.id}`}>
            <Button variant="link" className="text-primary hover:text-blue-700 font-medium">
              Ver detalhes
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
