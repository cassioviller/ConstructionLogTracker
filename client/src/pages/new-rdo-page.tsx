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
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { insertRdoSchema } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button as ButtonUI } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Create a schema for the complete RDO form
const rdoFormSchema = insertRdoSchema;
type RdoFormData = z.infer<typeof rdoFormSchema>;

export default function NewRdoPage() {
  const { id: projectId } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
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
  
  // Função para atualizar a data no formData quando o usuário seleciona uma data
  const onDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        date: format(date, "yyyy-MM-dd")
      }));
    }
  };

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
      // Isso é importante porque não queremos duplicar as fotos no banco de dados
      const rdoWithoutPhotos = {
        ...rdo,
        photos: [] // Removemos completamente as fotos do objeto RDO
      };
      
      // Criar o RDO sem as fotos
      const res = await apiRequest("POST", "/api/rdos", rdoWithoutPhotos);
      const createdRdo = await res.json();
      
      // Agora fazemos upload das fotos associando-as ao RDO criado
      if (photosToUpload && photosToUpload.length > 0) {
        const photoUploadPromises = photosToUpload.map(async (photo: any) => {
          try {
            // Usar o base64 da foto para enviar ao servidor
            const photoData = {
              url: photo.url, // Este já contém o base64 da imagem
              caption: photo.caption,
              rdoId: createdRdo.id
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
            <Popover>
              <PopoverTrigger asChild>
                <ButtonUI
                  variant="outline"
                  className="ml-2 h-9 pl-3 text-left font-normal"
                >
                  {selectedDate ? (
                    format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                </ButtonUI>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={onDateChange}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
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
          <div>
            <Button onClick={handleSubmit} disabled={createRdoMutation.isPending}>
              {createRdoMutation.isPending ? "Enviando..." : "Finalizar e Enviar"}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
