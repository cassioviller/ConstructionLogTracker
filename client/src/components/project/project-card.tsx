import { Link } from "wouter";
import { Project } from "@shared/schema";
import { Building2, Calendar, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  // Generate user initials for display
  const initials = [
    { text: "JS", bg: "bg-primary" },
    { text: "MB", bg: "bg-amber-500" },
    { text: "FL", bg: "bg-green-500" },
  ];

  // Select an image based on project type or project ID to maintain consistency
  const imageUrls = [
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300",
    "https://pixabay.com/get/gc74f6b86d7af929db5fa77ba653fcb0760a4393d820c05c9627ec40fb4cec945da1e81c6dd2d898560d6a471319beedbe5cb9c9cb547c46164fa9c1f67e7e163_1280.jpg",
    "https://pixabay.com/get/g132091d7148381c66bf790fa17261fbe8ad93bf8e0bb3252ad7f18967c1e2dc9f87a09703927f58e5bfb84df0294db084d4ac1d68dd50f11b5d5dc02d4478b63_1280.jpg",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300"
  ];

  const imageUrl = imageUrls[project.id % imageUrls.length];

  // Status indicators
  const statusLabels = {
    active: "Em andamento",
    paused: "Pausado",
    planning: "Planejamento",
    completed: "Concluído"
  };

  const statusColors = {
    active: "bg-green-500",
    paused: "bg-amber-500",
    planning: "bg-blue-500",
    completed: "bg-slate-500"
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-40 bg-slate-200 relative">
        <img 
          src={imageUrl} 
          alt={`${project.name} - Vista do projeto`} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <span className={`px-2 py-1 ${statusColors[project.status as keyof typeof statusColors]} text-white text-xs rounded-full`}>
            {statusLabels[project.status as keyof typeof statusLabels]}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-800">{project.name}</h3>
        <p className="text-slate-500 text-sm mb-3">
          {project.client} • {project.location}
        </p>
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              <span className="font-medium">Início:</span>{" "}
              {formatDate(new Date(project.startDate))}
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              <span className="font-medium">Previsão:</span>{" "}
              {project.endDate ? formatDate(new Date(project.endDate)) : "N/A"}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            {initials.slice(0, 3).map((initial, index) => (
              <div 
                key={index}
                className={`h-8 w-8 rounded-full ${initial.bg} text-white flex items-center justify-center text-xs`}
              >
                {initial.text}
              </div>
            ))}
          </div>
          <Link href={`/projects/${project.id}`}>
            <a className="text-primary hover:text-blue-700 font-medium">
              Ver detalhes
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
