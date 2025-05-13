import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import NavigationSidebar from "@/components/navigation-sidebar";
import MobileFooterNav from "@/components/mobile-footer-nav";
import ProjectCard from "@/components/project-card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema for new project
const newProjectSchema = z.object({
  name: z.string().min(3, "Nome do projeto deve ter pelo menos 3 caracteres"),
  client: z.string().min(2, "Nome do cliente é obrigatório"),
  location: z.string().min(2, "Localização é obrigatória"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  expectedEndDate: z.string().optional(),
  status: z.string().min(1, "Status é obrigatório"),
});

export default function ProjectsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  
  // Query to get projects
  const { data: projects, isLoading } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      return [];
    },
  });
  
  // Setup form
  const form = useForm<z.infer<typeof newProjectSchema>>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: "",
      client: "",
      location: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      expectedEndDate: "",
      status: "planning",
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof newProjectSchema>) => {
    try {
      await apiRequest("POST", "/api/projects", {
        ...values,
        createdBy: user?.id,
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      // Reset form and close dialog
      form.reset();
      setNewProjectOpen(false);
      
      toast({
        title: "Projeto criado",
        description: "O projeto foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o projeto. Tente novamente.",
        variant: "destructive",
      });
    }
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Projetos</h1>
              <p className="text-slate-500">Gerencie todos os seus projetos de obra</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Novo Projeto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Novo Projeto</DialogTitle>
                    <DialogDescription>
                      Preencha as informações para criar um novo projeto de obra.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Projeto</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Edifício Comercial Aurora" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="client"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cliente</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Construtora XYZ" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Localização</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: São Paulo - SP" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Descrição do projeto..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Início</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="expectedEndDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Previsão de Término</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              >
                                <option value="planning">Planejamento</option>
                                <option value="active">Em andamento</option>
                                <option value="on_hold">Paralisado</option>
                                <option value="completed">Concluído</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setNewProjectOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">Criar Projeto</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white h-64 rounded-lg shadow-md p-4 animate-pulse">
                  <div className="h-32 bg-slate-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-24 bg-slate-200 rounded-md"></div>
                    <div className="h-8 w-24 bg-slate-200 rounded-md"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects && projects.length > 0 ? (
                projects.map((project, index) => (
                  <ProjectCard key={project.id || index} project={project} />
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center p-12">
                  <div className="mx-auto w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum projeto encontrado</h3>
                  <p className="text-slate-500 mb-4">Comece criando seu primeiro projeto de obra</p>
                  <Button onClick={() => setNewProjectOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Criar Novo Projeto
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      
      <MobileFooterNav />
    </div>
  );
}
