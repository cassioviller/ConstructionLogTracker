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
import { useState, useEffect } from "react";
import { insertRdoSchema } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";

// Create a schema for the complete RDO form
const rdoFormSchema = insertRdoSchema;
type RdoFormData = z.infer<typeof rdoFormSchema>;

export default function EditRdoPage() {
  const { projectId, rdoId } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<RdoFormData | null>(null);

  // Fetch RDO data
  const { data: rdo, isLoading: isRdoLoading } = useQuery({
    queryKey: [`/api/rdos/${rdoId}`]
  });
  
  // Fetch project info using the projectId from the RDO
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: [`/api/projects/${rdo?.projectId}`],
    enabled: !!rdo?.projectId,
  });

  // Quando os dados do RDO chegarem, alimentamos o estado do formulário
  useEffect(() => {
    if (rdo) {
      setFormData({
        projectId: rdo.projectId, // Usar projectId do RDO
        date: rdo.date,
        weatherMorning: rdo.weatherMorning,
        weatherAfternoon: rdo.weatherAfternoon,
        weatherNight: rdo.weatherNight,
        weatherNotes: rdo.weatherNotes || "",
        workforce: rdo.workforce || [],
        equipment: rdo.equipment || [],
        activities: rdo.activities || [],
        occurrences: rdo.occurrences || [],
        comments: rdo.comments || [],
      });
    }
  }, [rdo]);

  // Fetch photos for this RDO
  const { data: photos, isLoading: isPhotosLoading } = useQuery({
    queryKey: [`/api/rdos/${rdoId}/photos`],
    enabled: !!rdoId
  });
  
  // Atualizar o formData com as fotos quando elas carregarem
  useEffect(() => {
    if (photos && formData && (!formData.photos || formData.photos.length === 0) && photos.length > 0) {
      setFormData(prev => prev ? { ...prev, photos } : null);
    }
  }, [photos, formData]);

  const updateRdoMutation = useMutation({
    mutationFn: async (rdo: RdoFormData) => {
      // Primeiro separamos as fotos que precisam ser uploadadas
      const photosToUpload = rdo.photos?.filter(
        (photo: any) => photo.needsUpload && photo.originalFile
      );
      
      // Removemos as fotos do objeto RDO para atualizar o relatório
      const rdoWithoutPhotos = {
        ...rdo,
        photos: [] // Removemos completamente as fotos do objeto RDO
      };
      
      // Atualizar o RDO sem as fotos
      const res = await apiRequest("PUT", `/api/rdos/${rdoId}`, rdoWithoutPhotos);
      const updatedRdo = await res.json();
      
      // Agora fazemos upload das fotos associando-as ao RDO
      if (photosToUpload && photosToUpload.length > 0) {
        const photoUploadPromises = photosToUpload.map(async (photo: any) => {
          try {
            // Usar o base64 da foto para enviar ao servidor
            const photoData = {
              url: photo.url, // Este já contém o base64 da imagem
              caption: photo.caption,
              rdoId: parseInt(rdoId)
            };
            
            // Enviar a foto para a API
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
      
      return updatedRdo;
    },
    onSuccess: (data) => {
      // Usamos o projectId do RDO retornado para invalidar consultas
      const projectIdFromRdo = data.projectId || rdo?.projectId;
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectIdFromRdo}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectIdFromRdo}/reports`] });
      queryClient.invalidateQueries({ queryKey: [`/api/rdos/${rdoId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/rdos/${rdoId}/photos`] });
      queryClient.invalidateQueries({ queryKey: ["/api/recent-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "RDO atualizado com sucesso",
        description: `O relatório #${data.number} foi atualizado.`,
      });
      
      navigate(`/project/${projectIdFromRdo}/rdo/${rdoId}`);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar RDO",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update form data sections
  const updateWeather = (weatherData: Partial<RdoFormData>) => {
    setFormData(prev => prev ? { ...prev, ...weatherData } : null);
  };

  const updateWorkforce = (workforce: any[]) => {
    setFormData(prev => prev ? { ...prev, workforce } : null);
  };

  const updateEquipment = (equipment: any[]) => {
    setFormData(prev => prev ? { ...prev, equipment } : null);
  };

  const updateActivities = (activities: any[]) => {
    setFormData(prev => prev ? { ...prev, activities } : null);
  };

  const updateOccurrences = (occurrences: any[]) => {
    setFormData(prev => prev ? { ...prev, occurrences } : null);
  };

  const updatePhotos = (photos: any[]) => {
    setFormData(prev => prev ? { ...prev, photos } : null);
  };

  const updateComments = (comments: any[]) => {
    setFormData(prev => prev ? { ...prev, comments } : null);
  };

  const handleSubmit = () => {
    if (formData) {
      updateRdoMutation.mutate(formData);
    }
  };

  const handleSaveDraft = () => {
    // Salvar como rascunho (não implementado)
    toast({
      title: "Funcionalidade não disponível",
      description: "Salvar como rascunho ainda não está implementado.",
    });
  };

  const cancelForm = () => {
    if (rdo) {
      navigate(`/project/${rdo.projectId}/rdo/${rdoId}`);
    } else {
      navigate('/projects');
    }
  };

  if (isProjectLoading || isRdoLoading || !formData) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!project || !rdo) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h3 className="text-lg font-medium text-slate-600 mb-2">RDO ou projeto não encontrado</h3>
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
          onClick={() => rdo ? navigate(`/project/${rdo.projectId}/rdo/${rdoId}`) : navigate("/projects")}
          className="mr-3"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Editar Relatório Diário de Obra</h1>
          <p className="text-slate-500">
            {project.name} • RDO #{rdo.number}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <h2 className="text-lg font-semibold text-slate-800">Informações do RDO</h2>
          <div>
            <span className="text-slate-500 text-sm">Data:</span>
            <span className="text-slate-800 text-sm font-medium ml-1">
              {format(new Date(rdo.date), "dd/MM/yyyy", { locale: ptBR })}
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
        <WorkforceSection onChange={updateWorkforce} projectId={rdo.projectId.toString()} initialData={formData.workforce} />
        <EquipmentSection onChange={updateEquipment} initialData={formData.equipment} />
        <ActivitiesSection onChange={updateActivities} initialData={formData.activities} />
        <OccurrencesSection onChange={updateOccurrences} initialData={formData.occurrences} />
        <PhotosSection onChange={updatePhotos} initialData={formData.photos} />
        <CommentsSection onChange={updateComments} user={user} initialData={formData.comments} />

        <div className="border-t border-slate-200 pt-6 flex justify-between">
          <Button variant="outline" onClick={cancelForm}>
            Cancelar
          </Button>
          <div className="space-x-2">
            <Button variant="outline" className="border-primary text-primary" onClick={handleSaveDraft}>
              Salvar Rascunho
            </Button>
            <Button onClick={handleSubmit} disabled={updateRdoMutation.isPending}>
              {updateRdoMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}