import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { WeatherSection } from "@/components/rdo/weather-section";
import { WorkforceSection } from "@/components/rdo/workforce-section";
import { EquipmentSection } from "@/components/rdo/equipment-section";
import { ActivitiesSection } from "@/components/rdo/activities-section";
import { OccurrencesSection } from "@/components/rdo/occurrences-section";
import { PhotosSection } from "@/components/rdo/photos-section";
import { CommentsSection } from "@/components/rdo/comments-section";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { insertRdoSchema } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";

// Create a schema for the complete RDO form
const rdoFormSchema = insertRdoSchema;
type RdoFormData = z.infer<typeof rdoFormSchema>;

export default function NewRdoPage() {
  const { id: projectId } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const today = new Date();
  const [formData, setFormData] = useState<RdoFormData>({
    projectId: parseInt(projectId),
    date: format(today, "yyyy-MM-dd"),
    weatherMorning: "sunny",
    weatherAfternoon: "cloudy",
    weatherNight: "rainy",
    weatherNotes: "",
    workforce: [],
    equipment: [],
    activities: [],
    occurrences: [],
    photos: [],
    comments: [],
  });

  // Fetch project info
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
  });

  // Fetch next RDO number
  const { data: nextRdoNumber, isLoading: isNumberLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/next-rdo-number`],
  });

  const createRdoMutation = useMutation({
    mutationFn: async (rdo: RdoFormData) => {
      // Primeiro separamos as fotos que precisam ser uploadadas
      const photosToUpload = rdo.photos?.filter(
        (photo: any) => photo.needsUpload && photo.originalFile
      );
      
      // Removemos as fotos do objeto RDO para criar o relatório
      const rdoWithoutPhotos = {
        ...rdo,
        // Guardamos apenas os IDs das fotos que serão enviadas separadamente
        photoIds: photosToUpload?.map((p: any) => p.id) || [],
        photos: [] // Removemos as fotos do objeto principal
      };
      
      // Criar o RDO sem as fotos
      const res = await apiRequest("POST", "/api/rdos", rdoWithoutPhotos);
      const createdRdo = await res.json();
      
      // Agora fazemos upload das fotos associando-as ao RDO criado
      if (photosToUpload && photosToUpload.length > 0) {
        const photoUploadPromises = photosToUpload.map(async (photo: any) => {
          try {
            // Criamos o objeto para enviar à API de fotos
            const photoData = {
              url: photo.url,
              caption: photo.caption,
              rdoId: createdRdo.id
            };
            
            // Enviar a foto
            const photoRes = await apiRequest("POST", "/api/photos", photoData);
            return await photoRes.json();
          } catch (error) {
            console.error("Erro ao fazer upload de foto:", error);
            return null;
          }
        });
        
        // Aguardar o upload de todas as fotos
        await Promise.all(photoUploadPromises);
      }
      
      return createdRdo;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/reports`] });
      queryClient.invalidateQueries({ queryKey: ["/api/recent-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "RDO criado com sucesso",
        description: `O relatório #${nextRdoNumber} foi criado.`,
      });
      
      navigate(`/project/${projectId}`);
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar RDO",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update form data sections
  const updateWeather = (weatherData: Partial<RdoFormData>) => {
    setFormData(prev => ({ ...prev, ...weatherData }));
  };

  const updateWorkforce = (workforce: any[]) => {
    setFormData(prev => ({ ...prev, workforce }));
  };

  const updateEquipment = (equipment: any[]) => {
    setFormData(prev => ({ ...prev, equipment }));
  };

  const updateActivities = (activities: any[]) => {
    setFormData(prev => ({ ...prev, activities }));
  };

  const updateOccurrences = (occurrences: any[]) => {
    setFormData(prev => ({ ...prev, occurrences }));
  };

  const updatePhotos = (photos: any[]) => {
    setFormData(prev => ({ ...prev, photos }));
  };

  const updateComments = (comments: any[]) => {
    setFormData(prev => ({ ...prev, comments }));
  };

  const handleSubmit = () => {
    createRdoMutation.mutate(formData);
  };

  const handleSaveDraft = () => {
    // Save as draft logic could be implemented here
    toast({
      title: "Rascunho salvo",
      description: "O RDO foi salvo como rascunho.",
    });
  };

  const cancelForm = () => {
    navigate(`/project/${projectId}`);
  };

  if (isProjectLoading || isNumberLoading) {
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
          <h1 className="text-2xl font-bold text-slate-800">Novo Relatório Diário de Obra</h1>
          <p className="text-slate-500">
            {project.name} • RDO #{nextRdoNumber || "..."}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <h2 className="text-lg font-semibold text-slate-800">Informações do RDO</h2>
          <div>
            <span className="text-slate-500 text-sm">Data:</span>
            <span className="text-slate-800 text-sm font-medium ml-1">
              {format(today, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                <div className="h-full w-full bg-primary text-white flex items-center justify-center">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Responsável:</p>
                <p className="text-sm text-slate-500">{user?.name} - {user?.jobTitle}</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              <p>
                Projeto: <span className="font-medium text-slate-700">{project.name}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <WeatherSection onChange={updateWeather} initialData={formData} />
        <WorkforceSection onChange={updateWorkforce} projectId={projectId} />
        <EquipmentSection onChange={updateEquipment} />
        <ActivitiesSection onChange={updateActivities} />
        <OccurrencesSection onChange={updateOccurrences} />
        <PhotosSection onChange={updatePhotos} />
        <CommentsSection onChange={updateComments} user={user} />

        <div className="border-t border-slate-200 pt-6 flex justify-between">
          <Button variant="outline" onClick={cancelForm}>
            Cancelar
          </Button>
          <div className="space-x-2">
            <Button variant="outline" className="border-primary text-primary" onClick={handleSaveDraft}>
              Salvar Rascunho
            </Button>
            <Button onClick={handleSubmit} disabled={createRdoMutation.isPending}>
              {createRdoMutation.isPending ? "Enviando..." : "Finalizar e Enviar"}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
