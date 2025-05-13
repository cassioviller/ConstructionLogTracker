import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ArrowLeft, 
  Download, 
  Printer,
  Clock,
  Calendar,
  User,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  Users,
  Truck,
  ClipboardCheck,
  CheckCircle
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { WorkforceSection } from "@/components/rdo/workforce-section";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function RdoDetailPage() {
  const { rdoId, id: projectId } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estado para controlar a edição
  const [showWorkforceEditor, setShowWorkforceEditor] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<any>({});

  // Fetch RDO details
  const { data: rdo, isLoading: isRdoLoading } = useQuery({
    queryKey: [`/api/rdos/${rdoId}`],
  });

  // Fetch project details
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
  });
  
  // Verificar se o usuário pode editar este RDO (implementação simples)
  // No futuro, poderia verificar permissões mais específicas
  const isEditable = !!user;
  
  // Mutation para atualizar o RDO
  const updateRdoMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/rdos/${rdoId}`, updatedFields);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/rdos/${rdoId}`] });
      
      toast({
        title: "RDO atualizado com sucesso",
        description: "As alterações foram salvas.",
      });
      
      // Limpar campos atualizados após sucesso
      setUpdatedFields({});
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar RDO",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Função para lidar com a atualização do RDO
  const handleUpdateRdo = () => {
    if (Object.keys(updatedFields).length === 0) {
      toast({
        title: "Nenhuma alteração detectada",
        description: "Faça alguma alteração antes de salvar.",
      });
      return;
    }
    
    updateRdoMutation.mutate();
  };

  const isLoading = isRdoLoading || isProjectLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!rdo || !project) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h3 className="text-lg font-medium text-slate-600 mb-2">Relatório não encontrado</h3>
          <p className="text-slate-500 mb-4">O relatório que você procura não existe ou foi removido</p>
          <Button onClick={() => navigate(`/project/${projectId}`)}>
            Voltar para o Projeto
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Função para obter ícone do clima
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny':
        return <CloudSun className="h-5 w-5 text-amber-500" />;
      case 'cloudy':
        return <Cloud className="h-5 w-5 text-slate-500" />;
      case 'rainy':
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      case 'storm':
        return <CloudLightning className="h-5 w-5 text-purple-500" />;
      default:
        return <Cloud className="h-5 w-5" />;
    }
  };

  // Função para obter texto do clima
  const getWeatherText = (weather: string) => {
    switch (weather) {
      case 'sunny':
        return 'Ensolarado';
      case 'cloudy':
        return 'Nublado';
      case 'rainy':
        return 'Chuvoso';
      case 'storm':
        return 'Tempestade';
      default:
        return weather;
    }
  };

  const handleDownloadPdf = () => {
    window.open(`/api/rdos/${rdoId}/pdf`, '_blank');
  };

  const formatDateBR = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: pt });
  };

  // Contadores para os resumos
  const workforceCount = Array.isArray(rdo.workforce) ? rdo.workforce.length : 0;
  const equipmentCount = Array.isArray(rdo.equipment) ? rdo.equipment.length : 0;
  const activitiesCount = Array.isArray(rdo.activities) ? rdo.activities.length : 0;
  const occurrencesCount = Array.isArray(rdo.occurrences) ? rdo.occurrences.length : 0;
  const photosCount = Array.isArray(rdo.photos) ? rdo.photos.length : 0;

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/project/${projectId}`)}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              RDO #{rdo.number} - {formatDateBR(rdo.date)}
            </h1>
            <p className="text-slate-500">{project.name}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadPdf}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Resumo do RDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-50 rounded-full">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Data do Relatório</h3>
                <p className="text-slate-500">{formatDateBR(rdo.date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-green-50 rounded-full">
                <User className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Responsável</h3>
                <p className="text-slate-500">{rdo.responsibleName || "Não informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-amber-50 rounded-full">
                <Cloud className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Condições Climáticas</h3>
                <div className="flex space-x-2 text-sm text-slate-500">
                  <span className="flex items-center">
                    {getWeatherIcon(rdo.weatherMorning)}
                    <span className="ml-1">Manhã: {getWeatherText(rdo.weatherMorning)}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    {getWeatherIcon(rdo.weatherAfternoon)}
                    <span className="ml-1">Tarde: {getWeatherText(rdo.weatherAfternoon)}</span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo principal do RDO */}
      <Tabs defaultValue="summary" className="w-full mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="workforce">Mão de Obra</TabsTrigger>
          <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="occurrences">Ocorrências</TabsTrigger>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
          <TabsTrigger value="comments">Comentários</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-medium">Mão de Obra</h3>
                  </div>
                  <p className="text-2xl font-bold">{workforceCount}</p>
                  <p className="text-sm text-slate-500">Pessoas trabalhando</p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Truck className="h-5 w-5 text-amber-500 mr-2" />
                    <h3 className="font-medium">Equipamentos</h3>
                  </div>
                  <p className="text-2xl font-bold">{equipmentCount}</p>
                  <p className="text-sm text-slate-500">Em operação</p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="font-medium">Atividades</h3>
                  </div>
                  <p className="text-2xl font-bold">{activitiesCount}</p>
                  <p className="text-sm text-slate-500">Executadas</p>
                </div>
              </div>
              
              {rdo.weatherNotes && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Observações sobre o Clima:</h3>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-md">{rdo.weatherNotes}</p>
                </div>
              )}
              
              {occurrencesCount > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Ocorrências:</h3>
                  <p className="text-slate-600">{occurrencesCount} ocorrência(s) registrada(s)</p>
                </div>
              )}
              
              {photosCount > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Registro Fotográfico:</h3>
                  <p className="text-slate-600">{photosCount} foto(s) anexada(s)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="workforce">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mão de Obra</CardTitle>
              {isEditable && !showWorkforceEditor && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowWorkforceEditor(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Editar Mão de Obra
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showWorkforceEditor ? (
                <div className="mb-4">
                  <WorkforceSection 
                    onChange={(workforce) => {
                      setUpdatedFields(prev => ({...prev, workforce}));
                    }}
                    initialData={rdo.workforce || []}
                    projectId={projectId}
                  />
                  <div className="flex justify-end mt-4 space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowWorkforceEditor(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => {
                        handleUpdateRdo();
                        setShowWorkforceEditor(false);
                      }}
                      disabled={updateRdoMutation.isPending}
                    >
                      {updateRdoMutation.isPending ? 
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : 
                        <><CheckCircle className="mr-2 h-4 w-4" /> Salvar Alterações</>}
                    </Button>
                  </div>
                </div>
              ) : Array.isArray(rdo.workforce) && rdo.workforce.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Função</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Quantidade</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Horário</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rdo.workforce.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-3 px-4 text-sm">{item.role}</td>
                          <td className="py-3 px-4 text-sm">{item.quantity}</td>
                          <td className="py-3 px-4 text-sm">
                            {item.startTime && item.endTime ? 
                              `${item.startTime} - ${item.endTime}` : 
                              "Não informado"}
                          </td>
                          <td className="py-3 px-4 text-sm">{item.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  {isEditable ? (
                    <>
                      <p className="mb-2">Nenhum registro de mão de obra para este relatório</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowWorkforceEditor(true)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Adicionar Mão de Obra
                      </Button>
                    </>
                  ) : (
                    <p>Nenhum registro de mão de obra para este relatório</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Equipamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(rdo.equipment) && rdo.equipment.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Equipamento</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Quantidade</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Horas</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rdo.equipment.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-3 px-4 text-sm">{item.name}</td>
                          <td className="py-3 px-4 text-sm">{item.quantity}</td>
                          <td className="py-3 px-4 text-sm">{item.hours}</td>
                          <td className="py-3 px-4 text-sm">{item.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Nenhum registro de equipamentos para este relatório
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Realizadas</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(rdo.activities) && rdo.activities.length > 0 ? (
                <div className="space-y-4">
                  {rdo.activities.map((activity: any, index: number) => (
                    <div key={index} className="border-b border-slate-100 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-slate-900">{activity.description}</h3>
                          {activity.notes && (
                            <p className="text-sm text-slate-500 mt-1">{activity.notes}</p>
                          )}
                        </div>
                        <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded">
                          {activity.completion}% concluído
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Nenhuma atividade registrada para este relatório
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="occurrences">
          <Card>
            <CardHeader>
              <CardTitle>Ocorrências</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(rdo.occurrences) && rdo.occurrences.length > 0 ? (
                <div className="space-y-4">
                  {rdo.occurrences.map((occurrence: any, index: number) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-slate-900">{occurrence.title}</h3>
                        <span className="text-xs text-slate-500">{occurrence.time}</span>
                      </div>
                      <p className="text-slate-600 mb-3">{occurrence.description}</p>
                      {Array.isArray(occurrence.tags) && occurrence.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {occurrence.tags.map((tag: string, tagIndex: number) => (
                            <span 
                              key={tagIndex} 
                              className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Nenhuma ocorrência registrada para este relatório
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Registro Fotográfico</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(rdo.photos) && rdo.photos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {rdo.photos.map((photo: any, index: number) => (
                    <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                      <a href={photo.url} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={photo.url} 
                          alt={photo.caption || `Foto ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                      </a>
                      <div className="p-3">
                        <p className="text-sm text-slate-600">{photo.caption || `Foto ${index + 1}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Nenhuma foto anexada a este relatório
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comentários</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(rdo.comments) && rdo.comments.length > 0 ? (
                <div className="space-y-4">
                  {rdo.comments.map((comment: any, index: number) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                          {comment.createdBy?.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-slate-900">{comment.createdBy?.name || "Usuário"}</h4>
                            <span className="text-xs text-slate-500">
                              {comment.createdAt ? format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm") : ""}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Nenhum comentário para este relatório
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}