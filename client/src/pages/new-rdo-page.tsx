import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import NavigationSidebar from "@/components/navigation-sidebar";
import MobileFooterNav from "@/components/mobile-footer-nav";
import { ChevronLeft } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import WeatherSelector from "@/components/weather-selector";
import WorkforceTable from "@/components/workforce-table";
import EquipmentTable from "@/components/equipment-table";
import ActivitiesSection from "@/components/activities-section";
import OccurrencesSection from "@/components/occurrences-section";
import PhotoUploadSection from "@/components/photo-upload-section";
import CommentsSection from "@/components/comments-section";

// RDO form schema
const rdoFormSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  weatherMorning: z.string().min(1, "Clima da manhã é obrigatório"),
  weatherAfternoon: z.string().min(1, "Clima da tarde é obrigatório"),
  weatherNight: z.string().min(1, "Clima da noite é obrigatório"),
  weatherNotes: z.string().optional(),
  workforce: z.array(
    z.object({
      role: z.string().min(1, "Função é obrigatória"),
      quantity: z.number().min(1, "Quantidade deve ser maior que zero"),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      notes: z.string().optional(),
    })
  ),
  equipment: z.array(
    z.object({
      name: z.string().min(1, "Nome do equipamento é obrigatório"),
      quantity: z.number().min(1, "Quantidade deve ser maior que zero"),
      hoursUsed: z.number().optional(),
      notes: z.string().optional(),
    })
  ),
  activities: z.array(
    z.object({
      description: z.string().min(1, "Descrição da atividade é obrigatória"),
      completionPercentage: z.number().min(0).max(100),
      status: z.string().min(1, "Status é obrigatório"),
    })
  ),
  occurrences: z.array(
    z.object({
      title: z.string().min(1, "Título da ocorrência é obrigatório"),
      description: z.string().min(1, "Descrição da ocorrência é obrigatória"),
      time: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
  ),
  photos: z.array(
    z.object({
      file: z.any().optional(),
      caption: z.string().optional(),
      preview: z.string().optional(),
    })
  ),
  comments: z.array(
    z.object({
      content: z.string().min(1, "Comentário é obrigatório"),
    })
  ).optional(),
});

type RdoFormValues = z.infer<typeof rdoFormSchema>;

export default function NewRDOPage() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get project details
  const { data: project } = useQuery({
    queryKey: [`/api/projects/${id}`],
    queryFn: async () => {
      return {
        id,
        name: "Edifício Corporativo Central",
        client: "Empresa ABC Ltda.",
      };
    },
  });

  // Get next report number
  const { data: nextReportNumber } = useQuery({
    queryKey: [`/api/projects/${id}/next-report-number`],
    queryFn: async () => {
      return 1;
    },
  });

  // Setup form
  const form = useForm<RdoFormValues>({
    resolver: zodResolver(rdoFormSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      weatherMorning: "ensolarado",
      weatherAfternoon: "nublado",
      weatherNight: "chuvoso",
      weatherNotes: "",
      workforce: [],
      equipment: [],
      activities: [],
      occurrences: [],
      photos: [],
      comments: [],
    },
  });

  // Handle form submission
  const onSubmit = async (values: RdoFormValues) => {
    setSubmitting(true);
    try {
      // In a real implementation, we would handle file uploads first
      // and then save the RDO data with the file URLs
      
      await apiRequest("POST", `/api/projects/${id}/rdos`, {
        ...values,
        projectId: id,
        reportNumber: nextReportNumber,
        createdBy: user?.id,
        status: "completed", // or 'draft' if we had a save draft button
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/rdos`] });
      
      toast({
        title: "RDO criado com sucesso",
        description: `O relatório #${nextReportNumber} foi salvo.`,
      });
      
      // Navigate to project detail page
      navigate(`/projects/${id}`);
    } catch (error) {
      toast({
        title: "Erro ao salvar RDO",
        description: "Ocorreu um erro ao criar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    // Similar to onSubmit but with draft status
    // This would be implemented in a real app
    toast({
      title: "Rascunho salvo",
      description: "O rascunho do relatório foi salvo com sucesso.",
    });
  };

  const handleGeneratePDF = () => {
    // This would generate a PDF in a real implementation
    toast({
      title: "Gerando PDF",
      description: "O PDF está sendo gerado...",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg text-primary">Meu Diário de Obra Pro</span>
        </div>
      </header>

      <div className="flex flex-1">
        <NavigationSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto pb-16 lg:pb-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}`)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Novo Relatório Diário de Obra</h1>
              <p className="text-slate-500">{project?.name} • RDO #{nextReportNumber || "..."}</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">Informações do RDO</CardTitle>
                  <div>
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <div className="flex items-center">
                          <span className="text-slate-500 text-sm mr-2">Data:</span>
                          <FormControl>
                            <input
                              type="date"
                              {...field}
                              className="shadow-sm focus:ring-primary focus:border-primary block sm:text-sm border-slate-300 rounded-md"
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm mr-3">
                        {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "JS"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Responsável:</p>
                        <p className="text-sm text-slate-500">{user?.name || "João Silva"} - {user?.role || "Engenheiro"}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-500">
                      <p>Projeto: <span className="font-medium text-slate-700">{project?.name}</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Weather Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Condições Climáticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="weatherMorning"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Manhã</FormLabel>
                          <FormControl>
                            <WeatherSelector 
                              value={field.value} 
                              onChange={field.onChange} 
                              id="morning"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="weatherAfternoon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tarde</FormLabel>
                          <FormControl>
                            <WeatherSelector 
                              value={field.value} 
                              onChange={field.onChange} 
                              id="afternoon"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="weatherNight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Noite</FormLabel>
                          <FormControl>
                            <WeatherSelector 
                              value={field.value} 
                              onChange={field.onChange} 
                              id="night"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="weatherNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações Climáticas</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva condições climáticas relevantes..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Workforce Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mão de Obra</CardTitle>
                </CardHeader>
                <CardContent>
                  <WorkforceTable 
                    workforce={form.watch("workforce")} 
                    onChange={(workforce) => form.setValue("workforce", workforce, { shouldValidate: true })}
                  />
                </CardContent>
              </Card>
              
              {/* Equipment Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Equipamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <EquipmentTable 
                    equipment={form.watch("equipment")} 
                    onChange={(equipment) => form.setValue("equipment", equipment, { shouldValidate: true })}
                  />
                </CardContent>
              </Card>
              
              {/* Activities Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Atividades Executadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivitiesSection 
                    activities={form.watch("activities")} 
                    onChange={(activities) => form.setValue("activities", activities, { shouldValidate: true })}
                  />
                </CardContent>
              </Card>
              
              {/* Occurrences Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ocorrências/Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                  <OccurrencesSection 
                    occurrences={form.watch("occurrences")} 
                    onChange={(occurrences) => form.setValue("occurrences", occurrences, { shouldValidate: true })}
                    userId={user?.id}
                  />
                </CardContent>
              </Card>
              
              {/* Photo Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Registro Fotográfico</CardTitle>
                </CardHeader>
                <CardContent>
                  <PhotoUploadSection 
                    photos={form.watch("photos")} 
                    onChange={(photos) => form.setValue("photos", photos, { shouldValidate: true })}
                  />
                </CardContent>
              </Card>
              
              {/* Comments Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comentários</CardTitle>
                </CardHeader>
                <CardContent>
                  <CommentsSection 
                    comments={form.watch("comments") || []}
                    onChange={(comments) => form.setValue("comments", comments, { shouldValidate: true })}
                    user={user}
                  />
                </CardContent>
              </Card>
              
              {/* Form Actions */}
              <Card>
                <CardFooter className="flex justify-end space-x-2 py-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleSaveDraft}
                    disabled={submitting}
                  >
                    Salvar Rascunho
                  </Button>
                  <Button 
                    type="button"
                    variant="secondary"
                    onClick={handleGeneratePDF}
                    disabled={submitting}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Gerar PDF
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Salvando..." : "Finalizar e Enviar"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </main>
      </div>
      
      <MobileFooterNav />
    </div>
  );
}
