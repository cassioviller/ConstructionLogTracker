import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Calendar, Image } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Photo } from "@shared/schema";

// Componente para exibir uma foto na galeria
const PhotoCard = ({ photo, onClick }: { photo: Photo; onClick: () => void }) => {
  return (
    <div 
      className="relative group overflow-hidden rounded-md cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square w-full bg-slate-200 overflow-hidden">
        <img 
          src={photo.url} 
          alt={photo.caption || "Foto do projeto"} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      {photo.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white p-2 text-sm">
          {photo.caption}
        </div>
      )}
    </div>
  );
};

// Componente modal para exibir uma foto ampliada
const PhotoModal = ({ photo, onClose }: { photo: Photo; onClose: () => void }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
        <img 
          src={photo.url} 
          alt={photo.caption || "Foto ampliada"} 
          className="max-w-full max-h-[80vh] object-contain"
        />
        {photo.caption && (
          <div className="bg-black/70 text-white p-3 text-sm mt-2 rounded">
            <p>{photo.caption}</p>
            <p className="text-xs text-slate-300 mt-1">
              {photo.createdAt && format(new Date(photo.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        )}
        <Button 
          variant="secondary" 
          className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
          onClick={onClose}
        >
          ✕
        </Button>
      </div>
    </div>
  );
};

export default function PhotoGalleryPage() {
  const [location] = useLocation();
  const [_, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  
  // Extrair o projectId da URL, se existir
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const projectIdFromUrl = urlParams.get('projectId');
  
  // Se tiver projectId na URL, use-o e selecione a tab correspondente
  useEffect(() => {
    if (projectIdFromUrl) {
      setSelectedTab(`project-${projectIdFromUrl}`);
    }
  }, [projectIdFromUrl]);

  // Buscar todos os projetos para as abas
  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });
  
  // Buscar informações de um projeto específico, se fornecido na URL
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: [`/api/projects/${projectIdFromUrl}`],
    enabled: !!projectIdFromUrl,
  });

  // Buscar todas as fotos ou filtrar por projeto
  const { data: photos, isLoading: isPhotosLoading } = useQuery({
    queryKey: [`/api/photos`, { projectId: projectIdFromUrl }],
    queryFn: async () => {
      const url = projectIdFromUrl 
        ? `/api/photos?projectId=${projectIdFromUrl}` 
        : `/api/photos`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Erro ao buscar fotos");
      }
      return await res.json();
    },
  });

  // Agrupar fotos por data com tratamento de erros
  const photosByDate = (photos || []).reduce((acc: Record<string, Photo[]>, photo: Photo) => {
    let date = "sem-data";
    
    try {
      if (photo.createdAt) {
        // Garantir que createdAt seja tratado como data
        const photoDate = new Date(photo.createdAt);
        if (!isNaN(photoDate.getTime())) {
          date = format(photoDate, "yyyy-MM-dd");
        }
      }
    } catch (error) {
      console.error("Erro ao formatar data da foto:", error);
    }
    
    acc[date] = acc[date] || [];
    acc[date].push(photo);
    return acc;
  }, {});

  // Ordenar as datas do mais recente para o mais antigo
  const sortedDates = Object.keys(photosByDate).sort((a, b) => {
    if (a === "sem-data") return 1;
    if (b === "sem-data") return -1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  if (isProjectLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(projectIdFromUrl ? `/projects/${projectIdFromUrl}` : '/projects')}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Galeria de Fotos</h1>
            {project && <p className="text-slate-500">{project.name}</p>}
          </div>
        </div>
        <Button onClick={() => navigate(`/new-rdo${projectIdFromUrl ? `?projectId=${projectIdFromUrl}` : ''}`)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo RDO
        </Button>
      </div>

      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="flex items-center">
            <Image className="h-4 w-4 mr-2" />
            Todas as Fotos
          </TabsTrigger>
          <TabsTrigger value="by-date" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Separadas por Dia
          </TabsTrigger>
          {/* Adicionar abas por projeto */}
          {!isProjectsLoading && projects && Array.isArray(projects) && 
            projects.map((proj) => (
              <TabsTrigger 
                key={`project-${proj.id}`}
                value={`project-${proj.id}`} 
                className="flex items-center"
              >
                <Building2 className="h-4 w-4 mr-2" />
                {proj.name}
              </TabsTrigger>
            ))
          }
        </TabsList>

        <TabsContent value="all" className="mt-2">
          {isPhotosLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          ) : (photos || []).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo: Photo) => (
                <PhotoCard 
                  key={photo.id} 
                  photo={photo} 
                  onClick={() => setSelectedPhoto(photo)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed rounded-lg">
              <Image className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-700">Nenhuma foto encontrada</h3>
              <p className="text-slate-500 mb-4">Adicione fotos para visualizá-las aqui</p>
              <Button onClick={() => navigate(`/project/${projectId}/add-photos`)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Fotos
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="by-date" className="mt-2">
          {isPhotosLoading ? (
            <div className="space-y-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-60 mb-4" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="aspect-square rounded-md" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : sortedDates.length > 0 ? (
            <div className="space-y-10">
              {sortedDates.map((date) => (
                <div key={date} className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 text-primary mr-2" />
                    <h3 className="text-xl font-semibold text-slate-800">
                      {date !== "sem-data" 
                        ? format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : "Data desconhecida"}
                    </h3>
                    <div className="ml-auto bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-sm font-medium">
                      {photosByDate[date].length} foto{photosByDate[date].length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photosByDate[date].map((photo) => (
                      <PhotoCard 
                        key={photo.id} 
                        photo={photo} 
                        onClick={() => setSelectedPhoto(photo)} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed rounded-lg">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-700">Nenhuma foto encontrada</h3>
              <p className="text-slate-500 mb-4">Adicione fotos para visualizá-las aqui</p>
              <Button onClick={() => navigate(`/project/${projectId}/add-photos`)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Fotos
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </MainLayout>
  );
}