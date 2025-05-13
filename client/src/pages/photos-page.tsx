import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Search, DownloadIcon } from "lucide-react";
import { useState } from "react";

export default function PhotosPage() {
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch projects for filter
  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Fetch photos with filters
  const { data: photos, isLoading: isPhotosLoading } = useQuery({
    queryKey: ["/api/photos", selectedProject, searchTerm],
    queryFn: async ({ queryKey }) => {
      const [_, projectId, search] = queryKey;
      const params = new URLSearchParams();
      
      if (projectId && projectId !== "all") params.append("projectId", projectId.toString());
      if (search) params.append("search", search.toString());
      
      const res = await fetch(`/api/photos?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch photos");
      return res.json();
    },
  });

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Galeria de Fotos</h1>
          <p className="text-slate-500">Visualize todas as fotos registradas nos projetos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <label htmlFor="project-filter" className="block text-sm font-medium text-slate-700 mb-1">
              Projeto
            </label>
            <Select
              value={selectedProject}
              onValueChange={setSelectedProject}
            >
              <SelectTrigger id="project-filter">
                <SelectValue placeholder="Todos os projetos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os projetos</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-2/3">
            <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Input
                id="search"
                type="text"
                placeholder="Buscar por legenda ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      {isPhotosLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {photos && photos.length > 0 ? (
            photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={photo.url}
                    alt={photo.caption || "Foto da obra"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-white">
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm text-slate-800">{photo.caption || "Sem legenda"}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-slate-500">
                      <p>{new Date(photo.createdAt).toLocaleDateString("pt-BR")}</p>
                      <p>{photo.projectName}</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                      {photo.userName?.charAt(0) || "U"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
              <h3 className="text-lg font-medium text-slate-600 mb-2">Nenhuma foto encontrada</h3>
              <p className="text-slate-500">Adicione fotos aos seus RDOs para visualizá-las aqui</p>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
}
